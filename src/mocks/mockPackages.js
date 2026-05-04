export const mockPackages = [
  {
    id: 'pkg-001',
    originId: 'central',
    destinationId: 'RNC',
    maxHops: 3,
    createdAt: '2026-03-01T12:00:00Z',
    deliverNotBefore: '2026-03-20T12:00:00Z',
    status: 'received',
    lastAction: 'received',
    canDeliver: true,
  },
  {
    id: 'pkg-002',
    originId: 'HGW',
    destinationId: 'COR',
    maxHops: 1,
    createdAt: '2026-03-05T12:00:00Z',
    deliverNotBefore: '2026-04-01T12:00:00Z',
    status: 'transit',
    lastAction: 'transit',
    canDeliver: false,
  },
];
