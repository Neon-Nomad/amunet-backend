const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session - ACCEPT ALL PAYMENT METHODS
router.post('/create-checkout', async (req, res) => {
  try {
    const { 
      email, 
      practiceName,
      includeSetupFee = false // Optional: charge setup fee
    } = req.body;

    // Line items for subscription
    const lineItems = [
      {
        price: process.env.STRIPE_PRICE_ID_MONTHLY, // $697/month
        quantity: 1,
      }
    ];

    // Optionally add setup fee (waived in Seattle promo, but keep option)
    if (includeSetupFee && process.env.STRIPE_PRICE_ID_SETUP) {
      lineItems.push({
        price: process.env.STRIPE_PRICE_ID_SETUP, // $2,497 one-time
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      // ACCEPT ALL PAYMENT METHODS
      payment_method_types: [
        'card',           // Credit/debit cards
        'us_bank_account', // ACH bank transfer (US only)
        'link',           // Stripe Link (one-click)
      ],

      // Apple Pay / Google Pay enabled automatically for card
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      },

      line_items: lineItems,
      mode: 'subscription',

      // Success/cancel URLs
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/canceled`,

      // Pre-fill customer email
      customer_email: email,

      // Metadata for tracking
      metadata: {
        practiceName: practiceName || '',
        source: 'amunet-landing-page'
      },

      // Allow promo codes
      allow_promotion_codes: true,

      // Collect billing address
      billing_address_collection: 'required',

      // Tax calculation (if you need it)
      automatic_tax: {
        enabled: false // Set to true if you collect sales tax
      }
    });

    res.json({ 
      sessionId: session.id, 
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Get session details (after successful payment)
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    res.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      subscriptionId: session.subscription
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// Create customer portal session (for managing subscription)
router.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.FRONTEND_URL
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Webhook handler
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  console.log(`🔔 Webhook received: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Payment successful!');
      console.log(`   Customer: ${session.customer_email}`);
      console.log(`   Subscription: ${session.subscription}`);

      // TODO: 
      // - Save customer to database
      // - Send welcome email
      // - Grant access to platform
      // - Notify team via email/Slack

      break;

    case 'customer.subscription.created':
      const newSub = event.data.object;
      console.log('🎉 New subscription created:', newSub.id);
      break;

    case 'customer.subscription.updated':
      const updatedSub = event.data.object;
      console.log('📝 Subscription updated:', updatedSub.id);
      console.log(`   Status: ${updatedSub.status}`);
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      console.log('❌ Subscription canceled:', deletedSub.id);

      // TODO: Revoke platform access
      break;

    case 'invoice.paid':
      const paidInvoice = event.data.object;
      console.log('💰 Invoice paid:', paidInvoice.id);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('⚠️  Payment failed for invoice:', failedInvoice.id);

      // TODO: Send dunning email, pause service
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
