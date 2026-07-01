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
    <title>VanSport API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: system-ui, sans-serif; background: #0f0f0f; }
      .tabs { display: flex; background: #0f0f0f; border-bottom: 1px solid #222; }
      .tabs button { padding: 14px 28px; color: #666; background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s; }
      .tabs button:hover { color: #fff; background: #1a1a1a; }
      .tabs button.active { color: #a78bfa; border-bottom-color: #a78bfa; background: #1a1a1a; }
      .panel { display: none; width: 100%; height: calc(100vh - 49px); }
      .panel.active { display: block; }
      iframe { width: 100%; height: 100%; border: none; }
    </style>
  </head>
  <body>
    <div class="tabs">
      <button class="active" onclick="switchTab('auth', this)">BetterAuth</button>
      <button onclick="switchTab('api', this)">VanSport API</button>
    </div>
    <div id="tab-auth" class="panel active">
      <iframe src="/api/auth/reference"></iframe>
    </div>
    <div id="tab-api" class="panel">
      <iframe id="api-frame"></iframe>
    </div>
    <script>
      function switchTab(tab, btn) {
        document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + tab).classList.add('active');
        if (tab === 'api' && !document.getElementById('api-frame').src) {
          document.getElementById('api-frame').src = '/api-docs/nestjs';
        }
      }
    </script>
  </body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('api-docs/nestjs')
  getNestJsDocs(@Res() res: Response) {
    const html = `<!doctype html>
<html>
  <head>
    <title>VanSport API - NestJS</title>
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
