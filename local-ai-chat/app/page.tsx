import ChatApp from "./components/ChatApp";
import { config } from "../lib/config";

export const dynamic = "force-dynamic";

export default function Home() {
  return <ChatApp modelName={config.ollamaModel} />;
}
