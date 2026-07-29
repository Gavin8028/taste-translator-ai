SELECT public.grant_paid_credits('4a968f4d-1fd8-4dc3-ad33-c27d490da98e'::uuid, 10);

INSERT INTO public.analytics_events (event_name, props)
VALUES ('scan_pack_purchased', jsonb_build_object(
  'packId', 'scan_pack_10',
  'amount', 10,
  'transactionId', 'txn_01kynqa96ht0jpfbebbkqrfvjq',
  'userId', '4a968f4d-1fd8-4dc3-ad33-c27d490da98e',
  'backfilled', true
));