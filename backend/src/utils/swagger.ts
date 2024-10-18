import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc"
import { version } from "../../package.json"
import { Express, Request, Response } from "express";
import path from "path";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "NexusPay REST API Docs",
            version
        },
        servers: [
            {
                url: '/api/v1',
                description: 'Version 1',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [path.join(__dirname, './../routes/**/*.ts')]
}

const swaggerSpec = swaggerJsdoc(options)

function swaggerDoc(app: Express, port: number) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    app.get('/docs.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })

    console.log(`Docs are available at http://localhost:${port}/docs`)
}


export default swaggerDoc