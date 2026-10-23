import { storageSync } from "@/data/local/sync";

export interface OrderItem {
  id: string;
  orderNumber: string;
  dinerName: string;
  soup: string;
  main: string;
  minutesAgo: number;
  delivered: boolean;
  expiresInMinutes: number;
}

const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: "ord-1",
    orderNumber: "42",
    dinerName: "Carlos Mejía",
    soup: "Locro de papa con queso",
    main: "Seco de pollo con maduro",
    minutesAgo: 6,
    delivered: false,
    expiresInMinutes: 24,
  },
  {
    id: "ord-2",
    orderNumber: "43",
    dinerName: "Andrea Morales",
    soup: "Sopa de lenteja",
    main: "Trucha frita con ensalada",
    minutesAgo: 12,
    delivered: false,
    expiresInMinutes: 18,
  },
  {
    id: "ord-3",
    orderNumber: "44",
    dinerName: "Luis Paredes",
    soup: "Caldo de gallina criolla",
    main: "Carne apanada con menestra",
    minutesAgo: 15,
    delivered: false,
    expiresInMinutes: 15,
  },
];

const STORAGE_KEY = "bocadoo-orders-records";

export class OrdersRepository {
  getOrders(): OrderItem[] {
    return storageSync.getItem<OrderItem[]>(STORAGE_KEY, DEFAULT_ORDERS);
  }

  getActiveOrders(): OrderItem[] {
    return this.getOrders().filter((o) => !o.delivered);
  }

  deliverOrder(orderId: string): OrderItem | null {
    const orders = this.getOrders();
    const current = orders.find((o) => o.id === orderId);
    if (!current) return null;
    const updated: OrderItem = { ...current, delivered: true };
    const nextOrders = orders.map((o) => (o.id === orderId ? updated : o));
    storageSync.setItem(STORAGE_KEY, nextOrders);
    return updated;
  }
}

export const ordersRepository = new OrdersRepository();
