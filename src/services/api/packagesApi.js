import { mockPackages } from '../../mocks/mockPackages';

export async function getPackages() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPackages), 300);
  });
}

export async function deliverPackage(packageId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, packageId }), 300);
  });
}
