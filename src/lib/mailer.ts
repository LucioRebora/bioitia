import nodemailer from "nodemailer";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function generateBudgetPDF(budget: any) {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  let options = {};

  if (isProd) {
    // In production (Vercel), we use sparticuz/chromium-min
    // We point to a remote graphics heavy binary to avoid Vercel's size limits
    const remoteExecutablePath = `https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar`;

    options = {
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    };
  } else {
    // In local development
    options = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    };
  }

  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  const itemsHtml = budget.items
    .map(
      (item: any) => `
    <tr style="border-bottom: 1px solid #edf2f7;">
      <td style="padding: 12px; font-size: 14px; color: #2d3748; font-weight: 500;">${item.nombre}</td>
      <td style="padding: 12px; font-size: 14px; color: #2d3748; text-align: right; font-weight: bold;">$${item.valor.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
    </tr>
  `
    )
    .join("");

  const pdfHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #2d3748; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1a202c; padding-bottom: 20px; }
        .logo { height: 70px; }
        .budget-info { text-align: right; }
        .budget-info h1 { margin: 0; font-size: 24px; color: #1a202c; }
        .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 30px; background: #f8fafc; border-radius: 8px; overflow: hidden; }
        .info-grid td { padding: 15px; font-size: 13px; border: 1px solid #edf2f7; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table th { background: #1a202c; color: white; padding: 12px; font-size: 12px; text-transform: uppercase; text-align: left; }
        .table td { padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
        .total-section { text-align: right; margin-top: 20px; }
        .total-box { display: inline-block; background: #1a202c; color: white; padding: 20px 40px; border-radius: 8px; }
        .footer { margin-top: 60px; border-top: 1px solid #edf2f7; padding-top: 20px; font-size: 11px; color: #718096; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="display: flex; gap: 20px; align-items: center;">
          <img src="https://www.lblab.com.ar/img/logo-lblab.png" class="logo">
          <div style="font-size: 10px; color: #718096; line-height: 1.4; border-left: 1px solid #edf2f7; padding-left: 20px;">
            <p style="margin: 0;"><strong>Dirección:</strong> Bolivar 1002</p>
            <p style="margin: 0;"><strong>Teléfono:</strong> 3446 - 434574</p>
            <p style="margin: 0;"><strong>Whatsapp:</strong> 3446 - 330365</p>
            <p style="margin: 0;"><strong>E-mail:</strong> laboratorio@lblab.com.ar</p>
            <p style="margin: 0;"><strong>Web:</strong> www.lblab.com.ar</p>
          </div>
        </div>
        <div class="budget-info">
          <h1 style="margin: 0; font-size: 14px; color: #1a202c; text-transform: uppercase; letter-spacing: 1px;">PRESUPUESTO</h1>
          <p style="margin: 3px 0 0; font-size: 10px; color: #718096;"><strong>Fecha de emisión:</strong> ${new Date(budget.createdAt).toLocaleDateString('es-AR')} ${new Date(budget.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</p>
        </div>
      </div>

      <table class="info-grid">
        <tr>
          <td><strong>Paciente:</strong> ${budget.paciente || "-"}</td>
          <td><strong>Teléfono:</strong> ${budget.telefono || "-"}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong> ${budget.email || "-"}</td>
          <td><strong>Lista:</strong> ${budget.planNombre || "Personalizada"}</td>
        </tr>
      </table>

      <table class="table">
        <thead>
          <tr>
            <th>Estudio / Análisis Clínico</th>
            <th style="text-align: right;">Costo</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-box">
          <span style="font-size: 14px; opacity: 0.8;">TOTAL</span><br>
          <span style="font-size: 28px; font-weight: bold;">$${budget.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div class="footer">
        <p>• Este presupuesto tiene validez por 30 días.</p>
        <p>• Los valores incluyen IVA.</p>
        <p>• Los precios están sujetos a modificaciones sin previo aviso.</p>
        <p>• La atención domiciliaria incluye viáticos según zona.</p>
        <br>
        <p style="font-weight: bold;">LB LAB – Comprometidos con la calidad y la seguridad en Analisis Clinicos</p>
      </div>
    </body>
    </html>
  `;

  await page.setContent(pdfHtml, { waitUntil: 'load' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '30px', bottom: '30px', left: '30px', right: '30px' }
  });

  await browser.close();
  return pdfBuffer;
}

export const sendBudgetEmail = async (budget: any) => {
  if (!budget.email) throw new Error("El presupuesto no tiene un email de destino.");

  // Generamos el PDF
  const pdfBuffer = await generateBudgetPDF(budget);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #2d3748; margin: 0; padding: 0; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: #ffffff; padding: 30px 20px; border-bottom: 4px solid #f8fafc; text-align: center; }
        .content { padding: 40px 30px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #718096; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://www.lblab.com.ar/img/logo-lblab.png" alt="LB Lab" style="height: 60px; width: auto; display: block; margin: 0 auto;">
          <p style="margin: 10px 0 0; font-size: 14px; font-weight: 600; color: #1a202c; text-transform: uppercase; letter-spacing: 1px;">Presupuesto de Análisis Clínicos</p>
        </div>
        <div class="content">
          <p>Hola <strong>${budget.paciente || "Paciente"}</strong>,</p>
          <p>Adjuntamos el detalle del presupuesto solicitado en formato PDF para que pueda descargarlo o imprimirlo.</p>
          <p>El total del presupuesto es de <strong>$${budget.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>.</p>
          <br>
          <p>Quedamos a su disposición por cualquier consulta.</p>
        </div>
        <div class="footer">
          LB LAB – Comprometidos con la calidad y la seguridad en Analisis Clinicos <br>
          Este es un mensaje automático, por favor no responda a este correo.
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"LB Lab" <${process.env.GMAIL_USER}>`,
    to: budget.email,
    subject: `Presupuesto de Análisis Clínicos - ${budget.paciente || "LB Lab"}`,
    html: htmlContent,
    attachments: [
      {
        filename: `Presupuesto_${budget.paciente?.replace(/\s+/g, '_') || 'LB_Lab'}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: 'application/pdf'
      }
    ]
  });
};
