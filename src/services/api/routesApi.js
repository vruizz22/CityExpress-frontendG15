import { mockRoutes } from '../../mocks/mockRoutes';

export async function getRoutes() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockRoutes), 300);
  });
}
