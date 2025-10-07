-- Add tip column to orders table
-- This stores the total tip amount that will be split among all participants

ALTER TABLE public.orders 
ADD COLUMN tip numeric DEFAULT 0 NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.orders.tip IS 'Total tip amount to be split among all participants in the order';

