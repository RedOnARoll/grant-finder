-- Remove grants whose recipients are state/local government entities
-- (not suitable for individual users or small businesses on GrantWay)

DELETE FROM grants
WHERE slug IN (
  'eda-economic-development-grants',               -- eligible: state/local govts, economic development districts
  'hud-choice-neighborhoods-initiative',           -- requires: local government applicant
  'doe-energy-efficiency-conservation-block-grant', -- requires: local government applicant
  'hrsa-maternal-child-health-block-grant',        -- requires: state agency applicant
  'hud-community-development-block-grant'          -- grants flow to states/cities/counties, not individuals
);
