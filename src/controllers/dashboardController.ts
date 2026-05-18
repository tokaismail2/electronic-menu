import { Response } from 'express';
import User from '../models/user';
import { AuthRequest } from '../types/express';
import Subscription from '../models/subscription';

export class DashboardController {

    static async getAllDashboardStats(req: AuthRequest, res: Response) {
        try {

            const now = new Date();

            const firstDayOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

            const [
                totalUsers,
                activeSubscriptions,
                monthlyRevenue,
                mostUserPaying,
                revenueChart,
                usersSubscriptionsTotals
            ] = await Promise.all([

                // total users
                User.countDocuments(),

                // active subscriptions
                Subscription.countDocuments({
                    status: 'active'
                }),

                // monthly revenue
                Subscription.aggregate([

                    {
                        $match: {
                            status: 'active',
                            start_date: {
                                $gte: firstDayOfMonth
                            }
                        }
                    },

                    {
                        $lookup: {
                            from: 'plans',
                            localField: 'plan_id',
                            foreignField: '_id',
                            as: 'plan'
                        }
                    },

                    {
                        $unwind: '$plan'
                    },

                    {
                        $group: {
                            _id: null,

                            monthlyRevenue: {
                                $sum: {
                                    $toDouble: '$plan.price'
                                }
                            }
                        }
                    }
                ]),

                // most paying user
                Subscription.aggregate([

                    {
                        $group: {
                            _id: '$user_id',

                            totalPaid: {
                                $sum: {
                                    $toDouble: '$price'
                                }
                            },

                            plan_id: {
                                $first: '$plan_id'
                            }
                        }
                    },

                    {
                        $sort: {
                            totalPaid: -1
                        }
                    },

                    {
                        $limit: 1
                    },

                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },

                    {
                        $lookup: {
                            from: 'plans',
                            localField: 'plan_id',
                            foreignField: '_id',
                            as: 'plan'
                        }
                    },

                    {
                        $unwind: '$user'
                    },

                    {
                        $unwind: '$plan'
                    },

                    {
                        $project: {
                            _id: 0,
                            user_name: '$user.user_name',
                            plan_name: '$plan.name',
                            totalPaid: 1
                        }
                    }
                ]),

                // revenue chart by day
                Subscription.aggregate([

                    {
                        $match: {
                            status: 'active',
                            start_date: {
                                $gte: firstDayOfMonth
                            }
                        }
                    },

                    {
                        $lookup: {
                            from: 'plans',
                            localField: 'plan_id',
                            foreignField: '_id',
                            as: 'plan'
                        }
                    },

                    {
                        $unwind: '$plan'
                    },

                    {
                        $group: {

                            _id: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: '$start_date'
                                }
                            },

                            totalRevenue: {
                                $sum: {
                                    $toDouble: '$plan.price'
                                }
                            }
                        }
                    },

                    {
                        $sort: {
                            _id: 1
                        }
                    },

                    {
                        $project: {
                            _id: 0,
                            date: '$_id',
                            totalRevenue: 1
                        }
                    }
                ]),

                // all users with total subscriptions amount
                Subscription.aggregate([

                    {
                        $lookup: {
                            from: 'plans',
                            localField: 'plan_id',
                            foreignField: '_id',
                            as: 'plan'
                        }
                    },

                    {
                        $unwind: '$plan'
                    },

                    {
                        $group: {

                            _id: '$user_id',

                            totalPaid: {
                                $sum: {
                                    $toDouble: '$plan.price'
                                }
                            },

                            subscriptionsCount: {
                                $sum: 1
                            }
                        }
                    },

                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },

                    {
                        $unwind: '$user'
                    },

                    {
                        $project: {

                            _id: 0,

                            user_id: '$user._id',

                            user_name: '$user.user_name',

                            totalPaid: 1,

                            subscriptionsCount: 1
                        }
                    },

                    {
                        $sort: {
                            totalPaid: -1
                        }
                    }
                ])

            ]);

            res.json({
                success: true,

                data: {

                    totalUsers,

                    activeSubscriptions,

                    monthlyRevenue:
                        monthlyRevenue[0]?.monthlyRevenue || 0,

                    mostUserPaying:
                        mostUserPaying[0]?.user_name || "",


                    revenueChart,

                    usersSubscriptionsTotals
                }
            });

        } catch (error) {

            console.error('Get all dashboard stats error:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}







