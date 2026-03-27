using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Grpc.Core;
using Grpc.Net.Client;
using Market;

namespace TradingMarket.Client.Services
{
    /// <summary>
    /// Wraps all gRPC service stubs with connection management.
    /// </summary>
    public class MarketGrpcClient : IDisposable
    {
        private readonly GrpcChannel _channel;
        public readonly MarketService.MarketServiceClient  Market;
        public readonly OrderService.OrderServiceClient    Orders;
        public readonly TraderService.TraderServiceClient  Traders;

        private string _authToken = string.Empty;

        public MarketGrpcClient(string serverAddress = "http://localhost:50051")
        {
            // Allow HTTP (non-TLS) for development. Use HTTPS in production.
            AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
            _channel = GrpcChannel.ForAddress(serverAddress);
            Market   = new MarketService.MarketServiceClient(_channel);
            Orders   = new OrderService.OrderServiceClient(_channel);
            Traders  = new TraderService.TraderServiceClient(_channel);
        }

        public void SetAuthToken(string token)
        {
            _authToken = token;
        }

        /// <summary>Returns call metadata with Bearer token.</summary>
        public Metadata GetHeaders()
        {
            var headers = new Metadata();
            if (!string.IsNullOrEmpty(_authToken))
                headers.Add("authorization", $"Bearer {_authToken}");
            return headers;
        }

        // ─── Market ──────────────────────────────────────────

        public async Task<GetMarketStatusResponse> GetMarketStatusAsync()
        {
            return await Market.GetMarketStatusAsync(
                new GetMarketStatusRequest(), headers: GetHeaders());
        }

        public async Task<ListSecuritiesResponse> ListSecuritiesAsync()
        {
            return await Market.ListSecuritiesAsync(
                new ListSecuritiesRequest(), headers: GetHeaders());
        }

        public async Task<GetPriceResponse> GetPriceAsync(string symbol)
        {
            return await Market.GetPriceAsync(
                new GetPriceRequest { Symbol = symbol }, headers: GetHeaders());
        }

        /// <summary>
        /// Subscribes to streaming price updates for one or more symbols.
        /// Calls <paramref name="onPrice"/> on each update until cancelled.
        /// </summary>
        public async Task SubscribePricesAsync(
            IEnumerable<string> symbols,
            Action<Price> onPrice,
            CancellationToken ct)
        {
            var req = new SubscribePricesRequest();
            req.Symbols.AddRange(symbols);

            using var call = Market.SubscribePrices(req, headers: GetHeaders(), cancellationToken: ct);
            await foreach (var price in call.ResponseStream.ReadAllAsync(ct))
            {
                onPrice(price);
            }
        }

        /// <summary>
        /// Subscribes to streaming trade events for a symbol.
        /// </summary>
        public async Task SubscribeTradesAsync(
            string symbol,
            Action<Trade> onTrade,
            CancellationToken ct)
        {
            using var call = Market.SubscribeTrades(
                new SubscribeTradesRequest { Symbol = symbol },
                headers: GetHeaders(),
                cancellationToken: ct);

            await foreach (var trade in call.ResponseStream.ReadAllAsync(ct))
            {
                onTrade(trade);
            }
        }

        // ─── Orders ──────────────────────────────────────────

        public async Task<PlaceOrderResponse> PlaceOrderAsync(
            string traderId, string symbol, OrderSide side, OrderType type,
            double quantity, double price)
        {
            return await Orders.PlaceOrderAsync(new PlaceOrderRequest
            {
                TraderId = traderId,
                Symbol   = symbol,
                Side     = side,
                Type     = type,
                Quantity = quantity,
                Price    = price,
            }, headers: GetHeaders());
        }

        public async Task<CancelOrderResponse> CancelOrderAsync(string orderId, string traderId)
        {
            return await Orders.CancelOrderAsync(
                new CancelOrderRequest { OrderId = orderId, TraderId = traderId },
                headers: GetHeaders());
        }

        public async Task<ListOrdersResponse> ListOrdersAsync(
            string traderId, OrderStatus status = OrderStatus.OrderStatusUnspecified, string symbol = "")
        {
            return await Orders.ListOrdersAsync(new ListOrdersRequest
            {
                TraderId = traderId,
                Status   = status,
                Symbol   = symbol,
            }, headers: GetHeaders());
        }

        // ─── Traders ─────────────────────────────────────────

        public async Task<RegisterTraderResponse> RegisterAsync(
            string username, string email, string password, string fullName, string country)
        {
            return await Traders.RegisterTraderAsync(new RegisterTraderRequest
            {
                Username = username,
                Email    = email,
                Password = password,
                FullName = fullName,
                Country  = country,
            });
        }

        public async Task<LoginResponse> LoginAsync(string email, string password)
        {
            return await Traders.LoginAsync(new LoginRequest
            {
                Email    = email,
                Password = password,
            });
        }

        public async Task<DepositResponse> DepositAsync(string traderId, double amount, string currency = "IDR")
        {
            return await Traders.DepositAsync(new DepositRequest
            {
                TraderId = traderId,
                Amount   = amount,
                Currency = currency,
            }, headers: GetHeaders());
        }

        public void Dispose() => _channel.Dispose();
    }
}
