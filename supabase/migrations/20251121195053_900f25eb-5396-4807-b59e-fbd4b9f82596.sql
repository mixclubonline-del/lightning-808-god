-- Create shared_presets table for cloud preset sharing
CREATE TABLE public.shared_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'uncategorized',
  description TEXT,
  author TEXT,
  config JSONB NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_presets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view shared presets
CREATE POLICY "Anyone can view shared presets" 
ON public.shared_presets 
FOR SELECT 
USING (true);

-- Allow anyone to download (increment counter)
CREATE POLICY "Anyone can update download count" 
ON public.shared_presets 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow anyone to share presets (insert)
CREATE POLICY "Anyone can share presets" 
ON public.shared_presets 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster searches
CREATE INDEX idx_shared_presets_category ON public.shared_presets(category);
CREATE INDEX idx_shared_presets_name ON public.shared_presets(name);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shared_presets_updated_at
BEFORE UPDATE ON public.shared_presets
FOR EACH ROW
EXECUTE FUNCTION public.update_sound_samples_updated_at();