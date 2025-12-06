-- Create youtubers table
CREATE TABLE public.youtubers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  avatar TEXT NOT NULL,
  subscriber_count TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transcripts table
CREATE TABLE public.transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtuber_id UUID NOT NULL REFERENCES public.youtubers(id) ON DELETE CASCADE,
  video_title TEXT NOT NULL,
  video_id TEXT NOT NULL,
  transcript TEXT NOT NULL,
  published_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.youtubers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view youtubers" 
ON public.youtubers 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view transcripts" 
ON public.transcripts 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can insert youtubers" 
ON public.youtubers 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update youtubers" 
ON public.youtubers 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete youtubers" 
ON public.youtubers 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert transcripts" 
ON public.transcripts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update transcripts" 
ON public.transcripts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete transcripts" 
ON public.transcripts 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_transcripts_youtuber_id ON public.transcripts(youtuber_id);
CREATE INDEX idx_transcripts_search ON public.transcripts USING gin(to_tsvector('arabic', transcript));