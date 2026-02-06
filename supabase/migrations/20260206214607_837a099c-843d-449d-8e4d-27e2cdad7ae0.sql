-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create subscriptions table for Stripe
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'free',
  plan TEXT NOT NULL DEFAULT 'free',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Create user dreams journal table
CREATE TABLE public.user_dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dream_text TEXT NOT NULL,
  interpretation TEXT,
  sources JSONB,
  mood TEXT,
  symbols TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_dreams
ALTER TABLE public.user_dreams ENABLE ROW LEVEL SECURITY;

-- User dreams policies
CREATE POLICY "Users can view their own dreams"
ON public.user_dreams FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dreams"
ON public.user_dreams FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams"
ON public.user_dreams FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams"
ON public.user_dreams FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_dreams_user_id ON public.user_dreams(user_id);
CREATE INDEX idx_user_dreams_created_at ON public.user_dreams(created_at DESC);
CREATE INDEX idx_user_dreams_symbols ON public.user_dreams USING GIN(symbols);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_dreams_updated_at
BEFORE UPDATE ON public.user_dreams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile and subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.subscriptions (user_id, status, plan)
  VALUES (NEW.id, 'free', 'free');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();