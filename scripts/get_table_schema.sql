-- Function to get detailed schema information for a table
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable boolean,
    column_default text,
    is_primary_key boolean,
    is_unique boolean,
    is_foreign_key boolean,
    foreign_table text,
    foreign_column text,
    description text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::boolean,
        c.column_default::text,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN u.column_name IS NOT NULL THEN true ELSE false END as is_unique,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
        fk.foreign_table::text,
        fk.foreign_column::text,
        pgd.description::text
    FROM information_schema.columns c
    LEFT JOIN (
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = get_table_schema.table_name
    ) pk ON c.column_name = pk.column_name
    LEFT JOIN (
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_name = get_table_schema.table_name
    ) u ON c.column_name = u.column_name
    LEFT JOIN (
        SELECT 
            kcu.column_name,
            ccu.table_name as foreign_table,
            ccu.column_name as foreign_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = get_table_schema.table_name
    ) fk ON c.column_name = fk.column_name
    LEFT JOIN pg_catalog.pg_statio_all_tables st
        ON st.schemaname = c.table_schema
        AND st.relname = c.table_name
    LEFT JOIN pg_catalog.pg_description pgd
        ON pgd.objoid = st.relid
        AND pgd.objsubid = c.ordinal_position
    WHERE c.table_name = get_table_schema.table_name
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_table_schema('your_table_name');

-- To get indexes for a table:
CREATE OR REPLACE FUNCTION get_table_indexes(table_name text)
RETURNS TABLE (
    index_name text,
    index_type text,
    is_unique boolean,
    index_columns text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.relname::text as index_name,
        am.amname::text as index_type,
        ix.indisunique::boolean as is_unique,
        string_agg(a.attname, ', ' ORDER BY array_position(ix.indkey, a.attnum))::text as index_columns
    FROM pg_class t
    JOIN pg_index ix ON ix.indrelid = t.oid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_attribute a ON a.attrelid = t.oid
    JOIN pg_am am ON i.relam = am.oid
    WHERE t.relname = get_table_indexes.table_name
    AND a.attnum = ANY(ix.indkey)
    GROUP BY i.relname, am.amname, ix.indisunique;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_table_indexes('your_table_name');

-- To get all information about a table in one query:
CREATE OR REPLACE FUNCTION get_table_info(table_name text)
RETURNS TABLE (
    info_type text,
    info_name text,
    info_details text
) AS $$
BEGIN
    -- Get table schema
    RETURN QUERY
    SELECT 
        'Column'::text as info_type,
        column_name::text as info_name,
        format(
            '%s (%s)%s%s%s%s',
            data_type,
            CASE WHEN is_nullable THEN 'nullable' ELSE 'not null' END,
            CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
            CASE WHEN is_primary_key THEN ' PRIMARY KEY' ELSE '' END,
            CASE WHEN is_unique THEN ' UNIQUE' ELSE '' END,
            CASE WHEN is_foreign_key THEN format(' REFERENCES %s(%s)', foreign_table, foreign_column) ELSE '' END
        )::text as info_details
    FROM get_table_schema(get_table_info.table_name);

    -- Get indexes
    RETURN QUERY
    SELECT 
        'Index'::text as info_type,
        index_name::text as info_name,
        format(
            '%s (%s)%s',
            index_type,
            index_columns,
            CASE WHEN is_unique THEN ' UNIQUE' ELSE '' END
        )::text as info_details
    FROM get_table_indexes(get_table_info.table_name);
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_table_info('your_table_name'); 