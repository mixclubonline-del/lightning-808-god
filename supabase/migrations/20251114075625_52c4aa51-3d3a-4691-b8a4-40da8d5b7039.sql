-- Create table for storing sound samples
CREATE TABLE IF NOT EXISTS public.sound_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  duration REAL NOT NULL,
  
  -- Audio features for matching
  spectral_centroid REAL, -- Brightness/tonal center
  spectral_rolloff REAL, -- High frequency content
  spectral_flatness REAL, -- Noise vs tonal
  rms_energy REAL, -- Overall loudness
  zero_crossing_rate REAL, -- Texture/noise level
  low_freq_energy REAL, -- Sub bass content
  mid_freq_energy REAL, -- Mid range content
  high_freq_energy REAL, -- High frequency content
  
  -- Metadata
  category TEXT DEFAULT 'uncategorized',
  tags TEXT[],
  bpm REAL,
  key TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sound_samples ENABLE ROW LEVEL SECURITY;

-- Public read access (samples are shareable)
CREATE POLICY "Anyone can view sound samples"
  ON public.sound_samples
  FOR SELECT
  USING (true);

-- Anyone can insert samples (for demo purposes, you can add auth later)
CREATE POLICY "Anyone can insert sound samples"
  ON public.sound_samples
  FOR INSERT
  WITH CHECK (true);

-- Anyone can update samples
CREATE POLICY "Anyone can update sound samples"
  ON public.sound_samples
  FOR UPDATE
  USING (true);

-- Anyone can delete samples
CREATE POLICY "Anyone can delete sound samples"
  ON public.sound_samples
  FOR DELETE
  USING (true);

-- Create index for faster searches
CREATE INDEX idx_sound_samples_category ON public.sound_samples(category);
CREATE INDEX idx_sound_samples_name ON public.sound_samples(name);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('sound-samples', 'sound-samples', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio files
CREATE POLICY "Anyone can view sound sample files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'sound-samples');

CREATE POLICY "Anyone can upload sound sample files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'sound-samples');

CREATE POLICY "Anyone can update sound sample files"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'sound-samples');

CREATE POLICY "Anyone can delete sound sample files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'sound-samples');

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_sound_samples_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
CREATE TRIGGER update_sound_samples_updated_at_trigger
  BEFORE UPDATE ON public.sound_samples
  FOR EACH ROW
  EXECUTE FUNCTION update_sound_samples_updated_at();