DO $$ 
DECLARE 
  r record;
BEGIN
  FOR r IN 
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE udt_name = 'pk_uuid' AND table_schema = 'campus'
  LOOP
    EXECUTE format('ALTER TABLE campus.%I ALTER COLUMN %I TYPE uuid USING %I::uuid', r.table_name, r.column_name, r.column_name);
  END LOOP;
END $$;
