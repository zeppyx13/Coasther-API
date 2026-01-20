const { z } = require("zod");

const listAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

module.exports = { listAnnouncementsQuerySchema };
