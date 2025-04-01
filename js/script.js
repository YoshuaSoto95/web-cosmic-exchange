document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.toggle-btn');
    const navContainer = document.querySelector('.nav-container');
    const toggleWrapper = document.querySelector('.toggle-wrapper');

    toggleBtn.addEventListener('click', function() {
        // Toggle la clase active para el menú
        navContainer.classList.toggle('active');
        
        // Toggle la clase para transformar el botón en X
        toggleWrapper.classList.toggle('active');
    });
});

// Función para formatear números a USD
const formatUSD = (number) => {
    if (number < 0.01) {
        return `$${number.toFixed(8)}`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(number);
};

// Función para actualizar los precios
const updatePrices = async () => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin,pepe&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();

        document.querySelectorAll('.crypto-card').forEach(card => {
            const cryptoId = card.dataset.crypto;
            if (data[cryptoId]) {
                const price = data[cryptoId].usd;
                const change = data[cryptoId].usd_24h_change;
                
                const priceElement = card.querySelector('.price');
                const changeElement = card.querySelector('.change');
                
                // Actualizar precio
                priceElement.textContent = formatUSD(price);
                
                // Actualizar cambio porcentual
                changeElement.textContent = `${change.toFixed(2)}%`;
                changeElement.className = `change ${change >= 0 ? 'positive' : 'negative'}`;
            }
        });
    } catch (error) {
        console.error('Error al obtener los precios:', error);
    }
};

// Actualizar precios inmediatamente y cada 30 segundos
updatePrices();
setInterval(updatePrices, 30000);

// Agregar animación cuando los precios cambian
const addPriceAnimation = () => {
    document.querySelectorAll('.price').forEach(price => {
        price.addEventListener('change', () => {
            price.classList.add('price-update');
            setTimeout(() => price.classList.remove('price-update'), 1000);
        });
    });
};

// Agregar estos estilos CSS para la animación
const style = document.createElement('style');
style.textContent = `
    .price-update {
        animation: priceUpdate 1s ease;
    }
    
    @keyframes priceUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Agregar el widget de TradingView
function initTradingViewWidget() {
    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "es",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview-widget"
    });
}

// Configuración de los pares con sus detalles
const futuresPairs = [
    {
        id: 'bitcoin',
        symbol: 'BTC',
        icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        maxLeverage: 125
    },
    {
        id: 'ethereum',
        symbol: 'ETH',
        icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        maxLeverage: 100
    },
    {
        id: 'solana',
        symbol: 'SOL',
        icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        maxLeverage: 75
    },
    {
        id: 'binancecoin',
        symbol: 'BNB',
        icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
        maxLeverage: 75
    },
    {
        id: 'ripple',
        symbol: 'XRP',
        icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
        maxLeverage: 50
    },
    {
        id: 'cardano',
        symbol: 'ADA',
        icon: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
        maxLeverage: 50
    },
    {
        id: 'avalanche-2',
        symbol: 'AVAX',
        icon: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
        maxLeverage: 50
    },
    {
        id: 'polkadot',
        symbol: 'DOT',
        icon: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
        maxLeverage: 50
    }
];

// Función para formatear números grandes
function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

// Función para formatear precios
function formatPrice(price) {
    if (price < 1) {
        return price.toFixed(4);
    }
    return price.toFixed(2);
}

// Función para actualizar los datos de la tabla
async function updateFuturesTable() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${futuresPairs.map(pair => pair.id).join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`);
        const data = await response.json();
        
        const tableBody = document.getElementById('futures-data');
        tableBody.innerHTML = '';

        futuresPairs.forEach(pair => {
            if (data[pair.id]) {
                const row = document.createElement('tr');
                const change24h = data[pair.id].usd_24h_change || 0;
                const volume24h = data[pair.id].usd_24h_vol || 0;
                
                row.innerHTML = `
                    <td>
                        <div class="pair-cell">
                            <img src="${pair.icon}" class="pair-icon" alt="${pair.symbol}">
                            <span class="pair-name">${pair.symbol}/USDT</span>
                        </div>
                    </td>
                    <td class="price-cell">$${formatPrice(data[pair.id].usd)}</td>
                    <td class="${change24h >= 0 ? 'positive' : 'negative'}">
                        ${change24h.toFixed(2)}%
                    </td>
                    <td>$${formatNumber(volume24h)}</td>
                    <td class="leverage-cell">
                        <span class="leverage-badge">${pair.maxLeverage}x</span>
                    </td>
                    <td>
                        <button class="login-btn">Operar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            }
        });
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

// Inicializar y actualizar datos cada 10 segundos
document.addEventListener('DOMContentLoaded', () => {
    updateFuturesTable();
    setInterval(updateFuturesTable, 10000);
});

// Función para comparar y animar cambios de precio
let previousPrices = {};

function comparePrices(newPrice, pair) {
    if (previousPrices[pair] !== undefined) {
        if (newPrice > previousPrices[pair]) {
            return 'price-up';
        } else if (newPrice < previousPrices[pair]) {
            return 'price-down';
        }
    }
    previousPrices[pair] = newPrice;
    return '';
}

// Amplía el array de monedas para incluir las nuevas
const spotCoins = [
    'bitcoin', 
    'ethereum', 
    'solana', 
    'binancecoin',
    'cardano',
    'polkadot',
    'avalanche-2',
    'ripple',
    'matic-network',
    'chainlink',
    'uniswap',
    'aave',
    'cosmos',
    'litecoin',
    'near',
    'algorand',
    'stellar',
    'monero',
    'vechain',
    'filecoin'
];

// Objeto con los detalles de las monedas
const coinDetails = {
    'bitcoin': { name: 'Bitcoin', symbol: 'BTC', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    'ethereum': { name: 'Ethereum', symbol: 'ETH', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    'solana': { name: 'Solana', symbol: 'SOL', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
    'binancecoin': { name: 'BNB', symbol: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
    'cardano': { name: 'Cardano', symbol: 'ADA', image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
    'polkadot': { name: 'Polkadot', symbol: 'DOT', image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
    'avalanche-2': { name: 'Avalanche', symbol: 'AVAX', image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
    'ripple': { name: 'XRP', symbol: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
    'matic-network': { name: 'Polygon', symbol: 'MATIC', image: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
    'chainlink': { name: 'Chainlink', symbol: 'LINK', image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
    'uniswap': { name: 'Uniswap', symbol: 'UNI', image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
    'aave': { name: 'Aave', symbol: 'AAVE', image: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png' },
    'cosmos': { name: 'Cosmos', symbol: 'ATOM', image: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png' },
    'litecoin': { name: 'Litecoin', symbol: 'LTC', image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png' },
    'near': { name: 'NEAR', symbol: 'NEAR', image: 'https://assets.coingecko.com/coins/images/10365/small/near_icon.png' },
    'algorand': { name: 'Algorand', symbol: 'ALGO', image: 'https://assets.coingecko.com/coins/images/4380/small/download.png' },
    'stellar': { name: 'Stellar', symbol: 'XLM', image: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png' },
    'monero': { name: 'Monero', symbol: 'XMR', image: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png' },
    'vechain': { name: 'VeChain', symbol: 'VET', image: 'https://assets.coingecko.com/coins/images/1167/small/VeChain-Logo-768x725.png' },
    'filecoin': { name: 'Filecoin', symbol: 'FIL', image: 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png' }
};

// Función para crear las tarjetas HTML
function createCoinCard(coinId) {
    const coin = coinDetails[coinId];
    return `
        <div class="spot-card">
            <div class="coin-icon">
                <img src="${coin.image}" alt="${coin.name}">
            </div>
            <div class="coin-info">
                <h3>${coin.name}</h3>
                <span class="coin-symbol">${coin.symbol}</span>
                <div class="coin-price">
                    <span class="price">Loading...</span>
                    <span class="change">Loading...</span>
                </div>
                <div class="coin-stats">
                    <div class="stat">
                        <span class="label">Vol. 24h</span>
                        <span class="value">Loading...</span>
                    </div>
                    <div class="stat">
                        <span class="label">Market Cap</span>
                        <span class="value">Loading...</span>
                    </div>
                </div>
                <button class="login-btn buy-btn">Comprar ${coin.symbol}</button>
            </div>
        </div>
    `;
}

// Función para crear el carrusel con múltiples conjuntos de tarjetas
function createSpotCarousel() {
    const track = document.querySelector('.spot-track');
    if (!track) return;

    // Limpiamos el contenido existente
    track.innerHTML = '';

    // Creamos dos conjuntos de grids (para el efecto infinito)
    for (let i = 0; i < 2; i++) {
        const grid = document.createElement('div');
        grid.className = 'spot-grid';
        
        // Agregamos tres conjuntos de tarjetas en cada grid
        for (let j = 0; j < 3; j++) {
            spotCoins.forEach(coinId => {
                const cardHTML = createCoinCard(coinId);
                grid.innerHTML += cardHTML;
            });
        }
        
        track.appendChild(grid);
    }
}

// Función para inicializar el carrusel
function initSpotCarousel() {
    createSpotCarousel();
    updateSpotCards();
}

// Actualizamos el evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initSpotCarousel();
    setInterval(updateSpotCards, 30000);
});

// Función para actualizar los datos de las tarjetas
async function updateSpotCards() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${spotCoins.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
        const data = await response.json();

        // Actualizar todas las instancias de cada moneda
        spotCoins.forEach(coin => {
            if (data[coin]) {
                const cards = document.querySelectorAll(`.spot-card:has(img[alt="${coinDetails[coin].name}"])`);
                cards.forEach(card => {
                    if (card) {
                        updateCardData(card, data[coin]);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error al obtener datos spot:', error);
    }
}

// Función para actualizar los datos de una tarjeta
function updateCardData(card, data) {
    const price = card.querySelector('.price');
    const change = card.querySelector('.change');
    const volume = card.querySelector('.stat .value');
    const marketCap = card.querySelectorAll('.stat .value')[1];

    price.textContent = formatUSD(data.usd);
    change.textContent = `${data.usd_24h_change.toFixed(2)}%`;
    change.className = `change ${data.usd_24h_change >= 0 ? 'positive' : 'negative'}`;
    volume.textContent = formatNumber(data.usd_24h_vol);
    marketCap.textContent = formatNumber(data.usd_market_cap);
}

// Función para manejar la pausa en hover
function setupCarouselHover() {
    const track = document.querySelector('.spot-track');
    if (track) {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    }
}

// Agregar al DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initSpotCarousel();
    setupCarouselHover();
    setInterval(updateSpotCards, 30000);
});

// Función para el efecto de aparición al hacer scroll
function initScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target); // Deja de observar después de revelar
            }
        });
    }, observerOptions);

    // Seleccionar todos los elementos que queremos animar
    const elementsToReveal = document.querySelectorAll('.reveal');
    elementsToReveal.forEach(element => {
        observer.observe(element);
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
});
