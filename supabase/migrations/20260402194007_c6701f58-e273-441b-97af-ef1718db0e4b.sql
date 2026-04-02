
CREATE POLICY "Anyone can update OTP"
ON public.otp_codes FOR UPDATE
TO anon, authenticated
USING (true);
