import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';

@ApiExcludeController()
@Controller()
export class ApiDocsController {
  @Get('api-docs')
  getDocs(@Res() res: Response) {
    const html = `<!doctype html>
<html>
  <head>
    <title>VanSport API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#app', {
        url: '/api/openapi.json',
        theme: 'purple',
      })
    </script>
  </body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
