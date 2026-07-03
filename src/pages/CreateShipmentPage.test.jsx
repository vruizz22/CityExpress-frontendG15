import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateShipmentPage from './CreateShipmentPage';
import { createQuote, createShipment, getRoutes } from '../services/api/shipmentService';
import { startPayment } from '../services/api/paymentService';
import { redirectToWebpay } from '../utils/webpayRedirect';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      email: 'test@test.com',
    },
  }),
}));

vi.mock('../services/api/shipmentService', () => ({
  getRoutes: vi.fn(),
  createQuote: vi.fn(),
  createShipment: vi.fn(),
}));

vi.mock('../services/api/paymentService', () => ({
  startPayment: vi.fn(),
}));

vi.mock('../utils/webpayRedirect', () => ({
  redirectToWebpay: vi.fn(),
}));

describe('CreateShipmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getRoutes.mockResolvedValue([
      { code: 'COR', name: 'Coruscant', enabled: true },
      { code: 'HGW', name: 'Hogwarts', enabled: true },
      { code: 'RNC', name: 'Rancagua', enabled: false },
    ]);
  });

  async function fillValidForm(user, options = {}) {
    const { priorityClass = 'medium', insured = false } = options;

    await screen.findByRole('option', { name: /COR - Coruscant/i });

    await user.selectOptions(screen.getByLabelText(/ciudad destino/i), 'COR');

    await user.clear(screen.getByLabelText(/alto en cm/i));
    await user.type(screen.getByLabelText(/alto en cm/i), '100');

    await user.clear(screen.getByLabelText(/ancho en cm/i));
    await user.type(screen.getByLabelText(/ancho en cm/i), '80');

    await user.clear(screen.getByLabelText(/profundidad en cm/i));
    await user.type(screen.getByLabelText(/profundidad en cm/i), '50');

    await user.selectOptions(screen.getByLabelText(/criterio de ruteo/i), 'price');

    await user.clear(screen.getByLabelText(/maxhops/i));
    await user.type(screen.getByLabelText(/maxhops/i), '5');

    await user.selectOptions(screen.getByLabelText(/prioridad/i), priorityClass);

    if (insured) {
      await user.click(screen.getByRole('checkbox', { name: /seguro/i }));
    }

    await user.type(screen.getByLabelText(/entregar no antes de/i), '2026-06-10T12:00');
    await user.type(screen.getByLabelText(/metacontent/i), 'frágil');
  }

  it('carga las rutas y muestra ciudades en el select', async () => {
    render(<CreateShipmentPage />);

    expect(await screen.findByRole('option', { name: /COR - Coruscant/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /HGW - Hogwarts/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /RNC - Rancagua/i })).toBeDisabled();
  });

  it('muestra controles de prioridad y seguro', async () => {
    render(<CreateShipmentPage />);

    await screen.findByRole('option', { name: /COR - Coruscant/i });

    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /baja/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /media/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /alta/i })).toBeInTheDocument();

    expect(screen.getByRole('checkbox', { name: /seguro/i })).toBeInTheDocument();
    expect(screen.getByText(/contratar seguro para este paquete/i)).toBeInTheDocument();
  });

  it('muestra la prima del 5% cuando el seguro está activo', async () => {
    const user = userEvent.setup();

    render(<CreateShipmentPage />);

    await screen.findByRole('option', { name: /COR - Coruscant/i });

    await user.click(screen.getByRole('checkbox', { name: /seguro/i }));

    expect(screen.getByText(/prima del 5%/i)).toBeInTheDocument();
  });

  it('muestra error si se intenta cotizar sin ciudad destino', async () => {
    const user = userEvent.setup();

    render(<CreateShipmentPage />);

    await user.click(screen.getByRole('button', { name: /cotizar envío/i }));

    expect(screen.getByText(/debes seleccionar una ciudad destino/i)).toBeInTheDocument();
    expect(createQuote).not.toHaveBeenCalled();
  });

  it('muestra error si las dimensiones superan 3000 cm', async () => {
    const user = userEvent.setup();

    render(<CreateShipmentPage />);

    await screen.findByRole('option', { name: /COR - Coruscant/i });

    await user.selectOptions(screen.getByLabelText(/ciudad destino/i), 'COR');
    await user.type(screen.getByLabelText(/alto en cm/i), '1000');
    await user.type(screen.getByLabelText(/ancho en cm/i), '1000');
    await user.type(screen.getByLabelText(/profundidad en cm/i), '1001');
    await user.type(screen.getByLabelText(/maxhops/i), '5');

    await user.click(screen.getByRole('button', { name: /cotizar envío/i }));

    const dimensionMessages = screen.getAllByText(
      /la suma de alto, ancho y profundidad no puede superar 3000 cm/i,
    );

    expect(dimensionMessages).toHaveLength(2);
    expect(dimensionMessages[1]).toHaveClass('error-message');
    expect(createQuote).not.toHaveBeenCalled();
  });

  it('cotiza correctamente y muestra el resumen con desglose de prioridad y seguro', async () => {
    const user = userEvent.setup();

    createQuote.mockResolvedValue({
      destinationId: 'COR',
      criteria: 'price',
      routeMetricCost: 12000,
      hops: 3,
      nextHop: 'HGW',
      path: ['HGW', 'RNC', 'COR'],
      fPrice: 1,
      baseAmount: 10000,
      priorityFactor: 2.5,
      insured: true,
      amount: 26250,
      reachable: true,
      maxHopsOk: true,
    });

    render(<CreateShipmentPage />);

    await fillValidForm(user, {
      priorityClass: 'high',
      insured: true,
    });

    await user.click(screen.getByRole('button', { name: /cotizar envío/i }));

    await waitFor(() => {
      expect(createQuote).toHaveBeenCalledWith({
        destinationId: 'COR',
        height: 100,
        width: 80,
        depth: 50,
        criteria: 'price',
        maxHops: 5,
        priorityClass: 'high',
        insured: true,
      });
    });

    expect(await screen.findByRole('heading', { name: /cotización/i })).toBeInTheDocument();
    expect(screen.getByText(/HGW → RNC → COR/i)).toBeInTheDocument();

    expect(screen.getByText(/base sin ajustes/i)).toBeInTheDocument();
    expect(screen.getByText(/factor prioridad/i)).toBeInTheDocument();
    expect(screen.getByText(/sí, prima 5%/i)).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /^crear envío$/i })).toBeInTheDocument();
  });

  it('cotiza con prioridad media y sin seguro por defecto', async () => {
    const user = userEvent.setup();

    createQuote.mockResolvedValue({
      destinationId: 'COR',
      criteria: 'price',
      routeMetricCost: 12000,
      hops: 3,
      nextHop: 'HGW',
      path: ['HGW', 'RNC', 'COR'],
      fPrice: 1,
      baseAmount: 15000,
      priorityFactor: 1,
      insured: false,
      amount: 15000,
      reachable: true,
      maxHopsOk: true,
    });

    render(<CreateShipmentPage />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /cotizar envío/i }));

    await waitFor(() => {
      expect(createQuote).toHaveBeenCalledWith({
        destinationId: 'COR',
        height: 100,
        width: 80,
        depth: 50,
        criteria: 'price',
        maxHops: 5,
        priorityClass: 'medium',
        insured: false,
      });
    });

    expect(await screen.findByRole('heading', { name: /cotización/i })).toBeInTheDocument();
  });

  it('muestra error visual si la ruta no es alcanzable', async () => {
    const user = userEvent.setup();

    createQuote.mockResolvedValue({
      destinationId: 'COR',
      criteria: 'price',
      routeMetricCost: null,
      hops: null,
      nextHop: null,
      path: [],
      fPrice: 1,
      baseAmount: null,
      priorityFactor: 1,
      insured: false,
      amount: null,
      reachable: false,
      maxHopsOk: false,
    });

    render(<CreateShipmentPage />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /cotizar envío/i }));

    expect(
      await screen.findByText(/no hay ruta disponible hacia esta ciudad/i),
    ).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /^crear envío$/i })).not.toBeInTheDocument();
  });

  it('muestra error visual si maxHops no alcanza', async () => {
    const user = userEvent.setup();

    createQuote.mockResolvedValue({
      destinationId: 'COR',
      criteria: 'price',
      routeMetricCost: 12000,
      hops: 6,
      nextHop: 'HGW',
      path: ['HGW', 'RNC', 'COR'],
      fPrice: 1,
      baseAmount: 15000,
      priorityFactor: 1,
      insured: false,
      amount: 15000,
      reachable: true,
      maxHopsOk: false,
    });

    render(<CreateShipmentPage />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /cotizar envío/i }));

    expect(await screen.findByText(/el maxhops seleccionado no alcanza/i)).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /^crear envío$/i })).not.toBeInTheDocument();
  });

  it('crea shipment después de una cotización válida incluyendo prioridad y seguro', async () => {
    const user = userEvent.setup();

    createQuote.mockResolvedValue({
      destinationId: 'COR',
      criteria: 'price',
      routeMetricCost: 12000,
      hops: 3,
      nextHop: 'HGW',
      path: ['HGW', 'RNC', 'COR'],
      fPrice: 1,
      baseAmount: 10000,
      priorityFactor: 2.5,
      insured: true,
      amount: 26250,
      reachable: true,
      maxHopsOk: true,
    });

    createShipment.mockResolvedValue({
      shipmentId: 'shipment-123',
      packageId: 'package-123',
      amount: 26250,
      quote: {},
    });

    render(<CreateShipmentPage />);

    await fillValidForm(user, {
      priorityClass: 'high',
      insured: true,
    });

    await user.click(screen.getByRole('button', { name: /cotizar envío/i }));

    await user.click(await screen.findByRole('button', { name: /^crear envío$/i }));

    await waitFor(() => {
      expect(createShipment).toHaveBeenCalledWith(
        expect.objectContaining({
          destinationId: 'COR',
          height: 100,
          width: 80,
          depth: 50,
          criteria: 'price',
          maxHops: 5,
          priorityClass: 'high',
          insured: true,
          metaContent: 'frágil',
        }),
      );
    });

    expect(await screen.findByText(/envío creado/i)).toBeInTheDocument();
    expect(screen.getByText(/shipment-123/i)).toBeInTheDocument();
    expect(screen.getByText(/package-123/i)).toBeInTheDocument();
  });

  it('inicia pago y redirige a Webpay', async () => {
    const user = userEvent.setup();

    createQuote.mockResolvedValue({
      destinationId: 'COR',
      criteria: 'price',
      routeMetricCost: 12000,
      hops: 3,
      nextHop: 'HGW',
      path: ['HGW', 'RNC', 'COR'],
      fPrice: 1,
      baseAmount: 15000,
      priorityFactor: 1,
      insured: false,
      amount: 15000,
      reachable: true,
      maxHopsOk: true,
    });

    createShipment.mockResolvedValue({
      shipmentId: 'shipment-123',
      packageId: 'package-123',
      amount: 15000,
      quote: {},
    });

    startPayment.mockResolvedValue({
      paymentId: 'payment-123',
      token: 'webpay-token',
      url: 'https://webpay.test/initTransaction',
    });

    render(<CreateShipmentPage />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /cotizar envío/i }));
    await user.click(await screen.findByRole('button', { name: /^crear envío$/i }));
    await user.click(await screen.findByRole('button', { name: /pagar con webpay/i }));

    await waitFor(() => {
      expect(startPayment).toHaveBeenCalledWith({
        shipmentId: 'shipment-123',
        returnUrl: expect.stringContaining('/payment-return'),
      });
    });

    expect(redirectToWebpay).toHaveBeenCalledWith(
      'https://webpay.test/initTransaction',
      'webpay-token',
    );
  });

  it('limpia el formulario al cancelar', async () => {
    const user = userEvent.setup();

    render(<CreateShipmentPage />);

    await screen.findByRole('option', { name: /COR - Coruscant/i });

    await user.selectOptions(screen.getByLabelText(/ciudad destino/i), 'COR');
    await user.type(screen.getByLabelText(/alto en cm/i), '100');
    await user.selectOptions(screen.getByLabelText(/prioridad/i), 'high');
    await user.click(screen.getByRole('checkbox', { name: /seguro/i }));

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByLabelText(/ciudad destino/i)).toHaveValue('');
    expect(screen.getByLabelText(/alto en cm/i)).toHaveValue(null);
    expect(screen.getByLabelText(/prioridad/i)).toHaveValue('medium');
    expect(screen.getByRole('checkbox', { name: /seguro/i })).not.toBeChecked();
  });
});
