import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");
  const url = req.nextUrl.searchParams.get("url");

  if (type === "open" && id) {
    // Track email open
    await prisma.emailSend
      .update({
        where: { trackingPixelId: id },
        data: { openedAt: new Date() },
      })
      .catch(() => {}); // Ignore if not found

    return new NextResponse(PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  if (type === "click" && id && url) {
    // Track click and redirect
    await prisma.emailSend
      .update({
        where: { trackingPixelId: id },
        data: { clickedAt: new Date() },
      })
      .catch(() => {});

    return NextResponse.redirect(url);
  }

  return new NextResponse(PIXEL, {
    headers: { "Content-Type": "image/gif" },
  });
}
