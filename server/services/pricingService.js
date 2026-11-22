// server/services/pricingService.js
// Centralized, Server-Authoritative Pricing Service for Hidden India

// Tier rates in INR per guest per day
const ACCOMMODATION_TIERS = {
  homestay: { name: 'Eco-Homestay & Community Hearth', ratePerGuestPerDay: 2200 },
  boutique: { name: 'Heritage Haveli / Alpine Timber Lodge', ratePerGuestPerDay: 5500 },
  luxury: { name: 'Private Royal Sanctuary & Glamping', ratePerGuestPerDay: 12000 },
};

// Transport modes in INR
const TRANSPORT_MODES = {
  standard: { name: 'Shared Scenic Regional Transit', type: 'per_guest', rate: 800 },
  private_suv: { name: 'Dedicated 4x4 Mountain Expedition SUV & Chauffeur', type: 'flat_per_day', rate: 3500 },
  heritage_rail: { name: 'Heritage Mountain Rail & Private Link', type: 'per_guest', rate: 1800 },
};

// Travel Style activities & guide rates in INR per guest per day
const STYLE_RATES = {
  cultural: { name: 'Cultural Lore & Artisan Guild Access', ratePerGuestPerDay: 1200 },
  trekking: { name: 'Certified Alpine Mountain Guide & Forest Permits', ratePerGuestPerDay: 1800 },
  photography: { name: 'Blue Hour Photography Expedition & Master Mentorship', ratePerGuestPerDay: 2200 },
  culinary: { name: 'Wild Foraging Walk & Heritage Clay Hearth Masterclass', ratePerGuestPerDay: 1500 },
  'eco-luxe': { name: 'Private Naturalist & Conservationist Escort', ratePerGuestPerDay: 2500 },
};

// Base Expedition Package Rate per guest per day (logistics, local permits, baseline porterage)
const BASE_EXPEDITION_DAILY_RATE = 1500;

// GST (Goods and Services Tax) rate for luxury & experiential tourism in India
const GST_RATE = 0.18; // 18%

export const PROMO_CODES = {
  HIDDEN10: {
    description: '10% Explorer Welcome Discount (Capped at ₹2,500)',
    apply: (subtotal) => Math.min(Math.round(subtotal * 0.10), 2500),
  },
  PIONEER20: {
    description: '₹2,000 Long-Journey Pioneer Grant (Min 7 days)',
    apply: (subtotal, days) => (days >= 7 ? 2000 : 0),
  },
};

/**
 * Server-authoritative calculation.
 * Never trusts any client-provided price or total.
 */
export const calculateServerPrice = ({
  durationDays = 3,
  guests = 1,
  travelStyle = 'cultural',
  budgetTier = 'boutique',
  transportMode = 'standard',
  promoCode = '',
}) => {
  const safeDays = Math.max(1, Math.min(30, parseInt(durationDays, 10) || 3));
  const safeGuests = Math.max(1, Math.min(20, parseInt(guests, 10) || 1));

  // 1. Base Package Price
  const packagePrice = BASE_EXPEDITION_DAILY_RATE * safeGuests * safeDays;

  // 2. Accommodation Price
  const tierConfig = ACCOMMODATION_TIERS[budgetTier] || ACCOMMODATION_TIERS.boutique;
  const accommodationPrice = tierConfig.ratePerGuestPerDay * safeGuests * safeDays;

  // 3. Transport Price
  const transportConfig = TRANSPORT_MODES[transportMode] || TRANSPORT_MODES.standard;
  let transportPrice = 0;
  if (transportConfig.type === 'flat_per_day') {
    transportPrice = transportConfig.rate * safeDays;
  } else {
    transportPrice = transportConfig.rate * safeGuests * safeDays;
  }

  // 4. Activities & Guide Price
  const styleConfig = STYLE_RATES[travelStyle] || STYLE_RATES.cultural;
  const activitiesPrice = styleConfig.ratePerGuestPerDay * safeGuests * safeDays;

  // 5. Subtotal
  const subtotal = packagePrice + accommodationPrice + transportPrice + activitiesPrice;

  // 6. Valid Promotional Discount
  let discountAmount = 0;
  let promoApplied = null;
  const cleanPromo = (promoCode || '').trim().toUpperCase();
  if (cleanPromo && PROMO_CODES[cleanPromo]) {
    const promo = PROMO_CODES[cleanPromo];
    discountAmount = promo.apply(subtotal, safeDays);
    promoApplied = {
      code: cleanPromo,
      description: promo.description,
      discountAmount,
    };
  }

  // 7. Taxes (18% GST on net taxable amount)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * GST_RATE);

  // 8. Final Authoritative Total
  const totalPrice = taxableAmount + taxAmount;

  return {
    durationDays: safeDays,
    guests: safeGuests,
    budgetTier,
    tierName: tierConfig.name,
    transportMode,
    transportName: transportConfig.name,
    travelStyle,
    styleName: styleConfig.name,
    itemized: {
      packagePrice,
      accommodationPrice,
      transportPrice,
      activitiesPrice,
    },
    subtotal,
    discountAmount,
    promoApplied,
    taxableAmount,
    taxAmount,
    taxRatePercentage: 18,
    totalPrice,
    currency: 'INR',
    formattedTotal: formatINR(totalPrice),
  };
};

export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
