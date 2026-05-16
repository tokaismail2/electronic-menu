import AuditLog from "../models/AuditLog";
import { Types } from "mongoose";

export const auditLogForSystem = async (company_id: Types.ObjectId, action_summary: string, type: string, entity_id: string, entity_name: string) => {
    await AuditLog.create({
        company_id,
        action_summary,
        type,
        entity_id,
        entity_name,
        isSystem: true
    });
}