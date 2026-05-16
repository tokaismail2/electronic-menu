import AuditLog from "../models/AuditLog";
import { AuthRequest } from "../types/express";
import { Response, NextFunction } from "express";
import { emitNotification } from "../utils/notificationSystem";
import TenantAdmin from "../models/tenantAdmin";
import User from "../models/User";

function auditLogUser(defaultAction: string, type: string, entity_name: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const action = res.locals.auditAction || defaultAction;

        try {
          const companyId =
            res.locals.companyId ||
            req.params.companyId ||
            req.body.company_id;

          let resolvedEntityId: string | undefined;

          switch (entity_name) {
            case "order":
              resolvedEntityId = res.locals.orderId || req.params.orderId || req.body.order_id;
              break;
            case "voting":
              resolvedEntityId = res.locals.votingId || req.params.votingId || req.body.voting_id;
              break;
            case "transfer":
              resolvedEntityId = res.locals.transferId || req.params.transferId || req.body.transfer_id;
              break;
            case "payment":
              resolvedEntityId = res.locals.paymentId || req.params.paymentId || req.body.payment_id;
              break;
            default:
              resolvedEntityId = res.locals.entityId || req.params.id;
          }

          if (!resolvedEntityId) return;

          await AuditLog.create({
            user_id: req.user._id,
            company_id: companyId,
            action_summary: action,
            type,
            entity_name,
            entity_id: resolvedEntityId,
          });

          const user = await User.findById(req.user._id).lean();
          if (!user) return;

          const data = { user_name: user.name, action_summary: action };
          emitNotification(`audit_log_${companyId}`, data);
          emitNotification(`audit_log_super_admin`, data);

        } catch (error) {
          console.error("Error saving audit log:", error);
        }
      }
    });
    next();
  };
}
function auditLogAdmin(defaultAction: string, type: string, entity_name: string, entity_id?: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const action = res.locals.auditAction || defaultAction;

        try {
          let resolvedEntityId: string | undefined = entity_id;
          switch (entity_name) {
            case "user":
              resolvedEntityId =
                entity_id ||
                res.locals.userId ||
                req.params.userId ||
                req.body.user_id;
              break;

            case "company":
              resolvedEntityId =
                entity_id ||
                res.locals.companyId ||
                req.params.companyId ||
                req.body.company_id;
              break;

            case "voting":
              resolvedEntityId =
                entity_id ||
                res.locals.votingId ||
                req.params.votingId ||
                req.body.voting_id;
              break;
            case "chat":
              resolvedEntityId =
                entity_id ||
                res.locals.chatId ||
                req.params.chatId ||
                req.body.chat_id;
              break;
            case "advertisement":
              resolvedEntityId =
                entity_id ||
                res.locals.advertisementId ||
                req.params.advertisementId ||
                req.body.advertisement_id;
              break;
            case "dividend":
              resolvedEntityId =
                entity_id ||
                res.locals.dividendId ||
                req.params.dividendId ||
                req.body.dividend_id;
              break;
            default:
              resolvedEntityId =
                entity_id || req.params.id || res.locals.entityId;
          }
          if (!resolvedEntityId) return;

          const audit = await AuditLog.create({
            company_admin_id: req.user._id,
            company_id: req.company_id || resolvedEntityId,
            action_summary: action,
            type,
            entity_name,
            entity_id: resolvedEntityId,
          });


          const company_id = audit.company_id.toString();

          let user;
          if (company_id) user = await TenantAdmin.findById(req.user).lean();

          let data = {
            user_name: user?.name || "Unknown User",
            action_summary: action,
          }
          emitNotification(`audit_log_${company_id}`, data);
          emitNotification(`audit_log_super_admin`, data);

          console.log(data);
          console.log(`Notification emitted to company ${company_id}`);

        } catch (error) {
          console.error("Error saving audit log:", error);
        }
      }
    });

    next();
  };
}

export { auditLogUser, auditLogAdmin };