// pages/api/portfolio/[id]/pdf.ts

import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  res.setHeader("Content-Encoding", "identity");
  res.setHeader("Content-Type", "application/pdf");

  const { id } = req.query;
  const portfolioId = Array.isArray(id) ? id[0] : id;

  if (!portfolioId) {
    return res.status(400).json({ error: "Missing portfolio id" });
  }

  // In dev: http://localhost:3000
  const baseUrl =
    process.env.PUBLIC_BASE_URL || "http://localhost:3000";

  const targetUrl = `${baseUrl}/portfolio/${portfolioId}?pdf=1`;

  console.log("Generating PDF for:", targetUrl);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      // required for many machines:
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // includes Tailwind background colors
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });

    await browser.close();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="portfolio-${id}.pdf"`
    );

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("Error generating portfolio PDF:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
}
