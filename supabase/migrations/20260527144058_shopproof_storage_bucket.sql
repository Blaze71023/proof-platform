/*
  # ShopPROOF Evidence Storage

  Creates a storage bucket for job evidence photos with appropriate access policies.
  - evidence bucket: stores job photos uploaded by authenticated shop staff
  - Only authenticated users can upload
  - Public read for url generation
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence',
  'evidence',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload evidence
CREATE POLICY "Authenticated users can upload evidence"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'evidence' AND auth.uid() IS NOT NULL);

-- Public read for displaying images
CREATE POLICY "Public can view evidence"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'evidence');

-- Uploaders can delete their own files
CREATE POLICY "Users can delete their own evidence"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
