-- Complete source-wire import metadata for publisher headlines
-- actually written by the 2026-11-04 verified-source snapshot.
-- Keep checked_at NULL: the first authorized page read still attempts a refresh.
UPDATE ica_wire_sources
SET last_success_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE last_success_at IS NULL AND imported_count > 0;
