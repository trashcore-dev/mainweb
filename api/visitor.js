export const config = {
  runtime: 'edge',
};

let visitorCount = 1245; // Replace with persistent storage later

export default async function handler(req) {
  visitorCount += 1;

  return new Response(JSON.stringify({ visitors: visitorCount }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
