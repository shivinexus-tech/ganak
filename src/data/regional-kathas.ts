// Authoritative bilingual regional kathas for every festival/vrat guide.
// Long-form narratives live in regional-kathas/batch-*.ts; merged into VRAT_VIDHI last.

import { REGIONAL_KATHAS_A } from "./regional-kathas/batch-a";
import { REGIONAL_KATHAS_B } from "./regional-kathas/batch-b";
import { REGIONAL_KATHAS_C } from "./regional-kathas/batch-c";
import { REGIONAL_KATHAS_D } from "./regional-kathas/batch-d";
import { REGIONAL_KATHAS_E } from "./regional-kathas/batch-e";

export const REGIONAL_KATHAS = {
  ...REGIONAL_KATHAS_A,
  ...REGIONAL_KATHAS_B,
  ...REGIONAL_KATHAS_C,
  ...REGIONAL_KATHAS_D,
  ...REGIONAL_KATHAS_E,
};
