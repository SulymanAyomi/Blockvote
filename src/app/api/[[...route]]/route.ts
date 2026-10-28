import { Hono } from "hono"
import { cors } from 'hono/cors'
import { handle } from "hono/vercel"
import auth from "@/features/auth/server/route"
import election from "@/features/elections/server/route"
import candidate from "@/features/candidate/server/route"
import admin from "@/features/admin/server/route"
import notifications from "@/features/notifications/server/route"


const app = new Hono().basePath("/api")
app.use('/api/*', cors())

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
    .route("/register", auth)
    .route("/election", election)
    .route("/candidate", candidate)
    .route("/admin", admin)
    .route("/notifications", notifications)


export const GET = handle(app)
export const POST = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)

export type AppType = typeof routes