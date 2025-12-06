import { FastifyInstance } from "fastify";
import { testEmailConfig } from "../utils/emailService";

export default async function adminEmailRoutes(app: FastifyInstance) {
  app.get("/api/admin/email/test-config", async (_req, reply) => {
    const result = testEmailConfig(); // uses your existing emailService.ts
    return reply.send({
      ok: result.configured,
      host: result.host,
      user: result.user,
    });
  });
}
