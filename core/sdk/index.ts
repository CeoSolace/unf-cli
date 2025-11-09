import { io, Socket } from 'socket.io-client';

/**
 * A lightweight client for interacting with the UnfilteredUK backend. Bot
 * developers can use this SDK to authenticate, join servers, send messages
 * and listen for real‑time events over WebSockets. HTTP endpoints can be
 * called via the `fetch` API built into modern runtimes.
 */
export class UnfilteredUKClient {
  private socket: Socket | null = null;
  private token: string;
  private baseUrl: string;

  constructor({ baseUrl, token }: { baseUrl: string; token: string }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  /**
   * Establish a WebSocket connection to the server using Socket.IO. The
   * authentication token is passed via the auth option as per Socket.IO v4.
   */
  connect(): void {
    this.socket = io(this.baseUrl, {
      auth: { token: this.token }
    });
  }

  /**
   * Register an event handler for incoming messages. Messages are provided
   * in their encrypted form; consumers should decrypt using their private
   * key if necessary.
   */
  onMessage(handler: (data: any) => void): void {
    this.socket?.on('message', handler);
  }

  /**
   * Send a message to a specific channel. The content should already be
   * encrypted and encoded (e.g. base64). Returns a promise that resolves
   * when the server acknowledges receipt.
   */
  async sendMessage(channelId: string, content: string): Promise<Response> {
    const res = await fetch(`${this.baseUrl}/api/messages/${channelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify({ content })
    });
    return res;
  }

  /**
   * Create a new server. Returns the newly created server object.
   */
  async createServer(name: string, description?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/servers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify({ name, description })
    });
    if (!res.ok) throw new Error(`Failed to create server: ${res.statusText}`);
    return res.json();
  }

  /**
   * Gracefully disconnect from the WebSocket. Always call this when your
   * bot shuts down to free resources on the server.
   */
  disconnect(): void {
    this.socket?.disconnect();
  }
}