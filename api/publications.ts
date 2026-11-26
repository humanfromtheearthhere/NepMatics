export function GET(): Response {
  return new Response(JSON.stringify({ publications: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
