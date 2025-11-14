-- Add slice-related columns to sound_samples table
ALTER TABLE sound_samples 
ADD COLUMN IF NOT EXISTS parent_recording_id uuid REFERENCES sound_samples(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS slice_index integer,
ADD COLUMN IF NOT EXISTS is_slice boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS slice_start_time real,
ADD COLUMN IF NOT EXISTS slice_end_time real;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sound_samples_parent_recording 
ON sound_samples(parent_recording_id);

CREATE INDEX IF NOT EXISTS idx_sound_samples_is_slice 
ON sound_samples(is_slice) 
WHERE is_slice = true;

-- Create index for faster queries on slices
CREATE INDEX IF NOT EXISTS idx_sound_samples_slice_index 
ON sound_samples(slice_index) 
WHERE is_slice = true;