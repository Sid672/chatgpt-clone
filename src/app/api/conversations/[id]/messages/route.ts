import { NextResponse } from "next/server";

export async function PATCH(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params;

	// Parse request body safely
	let body: { title?: string } = {};
	try {
		body = await req.json();
	} catch {
		// ignore parse errors — body stays empty
	}

	const title = body?.title;

	if (!title) {
		return NextResponse.json({ error: "title required" }, { status: 400 });
	}

	if (!id) {
		return NextResponse.json({ error: "missing id" }, { status: 400 });
	}

	// In a real app, you'd update the conversation title in a DB here.
	// For now, just echo back the result.
	return NextResponse.json({
		id,
		title,
		message: "Conversation title updated (mock response)",
	});
}
