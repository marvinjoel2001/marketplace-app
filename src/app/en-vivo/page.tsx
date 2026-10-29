import { redirect } from 'next/navigation';

// Lives are listed in the TikTok live directory; each registered store keeps its page at /en-vivo/[slug].
export default function LiveStoresPage() {
  redirect('/live');
}
