/**
 * Buyer-intent job guides — money keywords, catalog-backed.
 * Calm natural living. Material honesty. Not gift listicles (/gifts).
 */
import type { BuyerGuide } from './types'

const U = '2026-08-06'
const P = '2026-08-06'

const AMAZON = {
  q: 'Why does checkout go to Amazon?',
  a: 'iBamboo curates and explains fit. Amazon handles live price, Prime eligibility, shipping, and returns for that listing. Confirm size and care notes on Amazon before you buy.',
}

export const buyerGuides: BuyerGuide[] = [
  {
    slug: 'bamboo-cutting-board-care',
    title: 'Bamboo Cutting Board Care That Actually Lasts',
    dek: 'Oil, wash, dry, and the habits that keep boards from cupping or smelling like last Tuesday’s onion.',
    primaryQuery: 'how to care for bamboo cutting board',
    category: 'cutting-boards',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 7,
    heroImage: '/brand/categories/cutting-boards.webp',
    intro:
      'Bamboo boards fail when people treat them like plastic. Soak them, stack them wet, and skip oil — then blame the material. Care is simple: hand wash, dry upright, oil when the grain looks thirsty. The right board for your counter makes care easier.',
    hardNo:
      'Hard no: dishwasher cycles as a lifestyle, soaking overnight “to sanitize,” and cutting frozen joints on a thin board until it splits.',
    productEntries: [
      {
        productSlug: 'grand-prep-board',
        rank: 1,
        badge: 'Daily driver',
        pickWhy:
          'A generous everyday surface that rewards proper drying space. If you only own one board, this class of size is where most home cooks land.',
      },
      {
        productSlug: 'nesting-board-set',
        rank: 2,
        badge: 'Task split',
        pickWhy:
          'Separate boards for produce vs proteins is hygiene theater that actually helps. Nested storage means care includes wiping each face, not just the top one.',
      },
      {
        productSlug: 'end-grain-butcher-block',
        rank: 3,
        badge: 'Heavy prep',
        pickWhy:
          'Thicker block energy for serious chopping. Heavier boards still need oil and never the dishwasher — mass does not equal invincibility.',
      },
      {
        productSlug: 'over-sink-prep-board',
        rank: 4,
        pickWhy:
          'Over-sink designs change rinse habits. Dry fully before stacking back over a damp sink edge or you train mold into the corners.',
      },
      {
        productSlug: 'charcuterie-board',
        rank: 5,
        pickWhy:
          'Serving boards need the same oil story as prep boards, plus a wipe after soft cheeses. Pretty grain still warps when left wet under a towel.',
      },
    ],
    sections: [
      {
        heading: 'Wash and dry — the non-negotiables',
        body: 'Warm water, mild soap, quick scrub, rinse, towel, then air-dry upright or on a rack. Trapping water between board and counter is how cupping starts. Never store dripping wet in a cabinet.',
      },
      {
        heading: 'Oil is maintenance, not magic',
        body: 'Food-safe mineral oil or board cream when the surface looks dry or pale. Wipe on, wait, wipe off excess. Over-oiling leaves a greasy film; under-oiling invites cracking at the edges.',
      },
      {
        heading: 'Smell and stain reality',
        body: 'Onion and beet happen. Lemon and salt scrubs help some stains; deep odors often need time and oil, not bleach baths that wreck fibers. Severely warped boards retire to décor — shopping again is cheaper than food safety denial.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Can bamboo boards go in the dishwasher?',
        a: 'Generally no. Heat and long water exposure force cupping and glue stress. Hand wash is the durable path.',
      },
      {
        q: 'How often should I oil?',
        a: 'When the board looks dry or water stops beading lightly. Weekly for heavy use; monthly for light use is a common range — your climate wins over calendars.',
      },
      {
        q: 'One board or several?',
        a: 'One large board works if you wash between tasks. A set makes raw proteins less of a mental load.',
      },
    ],
  },
  {
    slug: 'first-bamboo-prep-board',
    title: 'First Bamboo Prep Board Worth Buying',
    dek: 'Size, thickness, juice wells, and when a nesting set beats one hero slab.',
    primaryQuery: 'best bamboo cutting board for home',
    category: 'cutting-boards',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    heroImage: '/brand/categories/cutting-boards.webp',
    intro:
      'A first board fails when it is too small for a roast chicken, too huge for the sink, or too cute to chop on. Buy for the meals you cook weekly — not the charcuterie photo you might host once.',
    hardNo:
      'Hard no: glass “boards,” tiny novelty slabs as your only surface, and end-grain showpieces you are afraid to mark.',
    productEntries: [
      {
        productSlug: 'grand-prep-board',
        rank: 1,
        badge: 'Start here',
        pickWhy:
          'Room to chop and park ingredients. Confirm dimensions against your sink and drying rack before you fall for a warehouse-sized block.',
      },
      {
        productSlug: 'nesting-board-set',
        rank: 2,
        badge: 'Flexible first kit',
        pickWhy:
          'If cabinet depth is tight, a set covers salad + onion duty without one massive rectangle. Care multiplies slightly; utility multiplies more.',
      },
      {
        productSlug: 'thick-chopping-block',
        rank: 3,
        pickWhy:
          'When you want mass that stays put under aggressive chopping. Heavier to wash — honesty check before cart.',
      },
      {
        productSlug: 'carving-board-with-well',
        rank: 4,
        pickWhy:
          'Roast nights need a juice groove. Not your daily tomato board unless you love washing channels.',
      },
      {
        productSlug: 'artisan-cooking-utensil-set',
        rank: 5,
        pickWhy:
          'Board without tools is half a station. A basic bamboo utensil set keeps nonstick pans happier than metal scrapers.',
      },
    ],
    sections: [
      {
        heading: 'Measure the real constraints',
        body: 'Sink width, dishwasher temptation (resist), and counter real estate. A board that cannot dry upright will age badly.',
      },
      {
        heading: 'Groove or no groove',
        body: 'Juice wells help carving. They annoy quick veg prep. Many kitchens eventually own both a flat daily board and a grooved carver.',
      },
      {
        heading: 'Marks are use, not failure',
        body: 'Knife scars mean dinner happened. If you want a pristine serving face forever, keep a separate charcuterie board.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Bamboo vs hardwood?',
        a: 'Bamboo is hard, light, and often kinder on storage weight. Hardwoods have their fans. Buy care habits either way.',
      },
      {
        q: 'Do I need end grain?',
        a: 'Nice for heavy knife work; not required for a first board. Start with a solid everyday slab you will actually use.',
      },
      {
        q: 'Handle or no handle?',
        a: 'Handles help hanging and carrying. They can snag drawers. Prefer what fits your storage story.',
      },
    ],
  },
  {
    slug: 'bathroom-organizer-humid',
    title: 'Bathroom Bamboo That Survives Humidity',
    dek: 'Trays, soap dishes, and shelves that need airflow — not sealed wet corners.',
    primaryQuery: 'bamboo bathroom organizer humidity',
    category: 'bath',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    heroImage: '/brand/categories/bath.webp',
    intro:
      'Bathroom bamboo fails when it sits in standing water. Steam is fine; a soap puddle under a closed tray is not. Choose pieces with drainage or slats, wipe weekly, and give wood a chance to dry between showers.',
    hardNo:
      'Hard no: sealed boxes of wet cotton pads, and bamboo left under a leaking bottle for a month because “it looks natural.”',
    productEntries: [
      {
        productSlug: 'slatted-soap-dish',
        rank: 1,
        badge: 'Drainage first',
        pickWhy:
          'Slats let bars dry. Solid dishes become soap soup. Empty the tray under it when scum builds — the dish is only half the system.',
      },
      {
        productSlug: 'corner-shower-shelf',
        rank: 2,
        pickWhy:
          'Corners collect moisture. Install so water can shed, and do not overload until bottles block airflow. Wipe mineral film before it cements.',
      },
      {
        productSlug: 'vanity-tray',
        rank: 3,
        pickWhy:
          'Corral serums without scattering rings on stone. Keep it off the wet edge of the sink when possible.',
      },
      {
        productSlug: 'toothbrush-stand',
        rank: 4,
        pickWhy:
          'Upright drying beats a closed cup of rinse water. Clean the base like you mean it once a week.',
      },
      {
        productSlug: 'toilet-brush-caddy',
        rank: 5,
        pickWhy:
          'Utility can still look calm. Empty standing water from the caddy; bamboo plus permanent wet is a bad marriage.',
      },
      {
        productSlug: 'soft-bristle-toothbrush-set',
        rank: 6,
        pickWhy:
          'The swap that often starts the bathroom edit — handles that match the stand story.',
      },
    ],
    sections: [
      {
        heading: 'Airflow beats aesthetics alone',
        body: 'Pretty grain will still mold if it never dries. Prefer open designs in wet zones; save tighter boxes for dry drawers.',
      },
      {
        heading: 'Weekly wipe habit',
        body: 'Sixty seconds with a dry cloth after cleaning day prevents the dark spots people blame on “cheap bamboo.”',
      },
      {
        heading: 'When plastic still wins',
        body: 'True constant-soak zones may want plastic or metal. Bamboo is for the calm middle — vanity, soap, light organization — not a submarine.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Will steam ruin bamboo?',
        a: 'Occasional steam is normal in baths. Permanent wet contact is the enemy. Dry between uses when you can.',
      },
      {
        q: 'Can I seal it myself?',
        a: 'Some people add food-safe finishes on trays. Follow product guidance; do not invent waterproofing with random garage varnish near toothpaste.',
      },
      {
        q: 'Dark spots appeared — now what?',
        a: 'Dry thoroughly, clean gently, improve airflow. Persistent black growth may mean retire the piece.',
      },
    ],
  },
  {
    slug: 'sustainable-swap-starter',
    title: 'Sustainable Kitchen Swap Starter Kit',
    dek: 'Replace the plastic that earns daily use first — utensils, boards, then table bits.',
    primaryQuery: 'bamboo kitchen swap plastic',
    category: 'kitchen',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    heroImage: '/brand/categories/kitchen.webp',
    intro:
      'Eco swaps fail as a cart of unused gadgets. Start with objects you touch every day: spoons that hit nonstick pans, a board that ends takeout cutting, plates that retire foam. Bamboo is one material among many — buy fewer, better-used pieces.',
    hardNo:
      'Hard no: replacing every object in one weekend and storing half of them forever, and “bamboo” labels without checking real use fit.',
    productEntries: [
      {
        productSlug: 'artisan-cooking-utensil-set',
        rank: 1,
        badge: 'Highest touch',
        pickWhy:
          'Daily cooking tools beat decorative bowls for impact. A set that lives in a crock gets used; a lonely specialty paddle does not.',
      },
      {
        productSlug: 'grand-prep-board',
        rank: 2,
        pickWhy:
          'Plastic boards crack and stain; glass dulls knives. A solid bamboo prep surface is a high-visibility swap.',
      },
      {
        productSlug: 'dinner-plate-set-of-four',
        rank: 3,
        pickWhy:
          'Tableware that replaces disposables for weeknights, not only dinner parties. Confirm care if your dishwasher is aggressive.',
      },
      {
        productSlug: 'reusable-chopstick-set',
        rank: 4,
        pickWhy:
          'Small, cheap, constant. Takeout nights stop needing plastic pairs if these live near the bowls.',
      },
      {
        productSlug: 'soft-bristle-toothbrush-set',
        rank: 5,
        pickWhy:
          'Bathroom is still a house system. Toothbrush handles are an easy plastic exit if you like the form.',
      },
      {
        productSlug: 'bamboo-cotton-swabs',
        rank: 6,
        pickWhy:
          'Micro swap with micro guilt reduction. Not heroic — just consistent.',
      },
    ],
    sections: [
      {
        heading: 'Order of operations',
        body: 'Utensils → board → table → bath. Each step should retire something real. If nothing leaves, you only added clutter.',
      },
      {
        heading: 'Durability is sustainability',
        body: 'A board that warps in three months is worse than a plastic one you already own. Care instructions are part of the purchase.',
      },
      {
        heading: 'Skip the theme park',
        body: 'You do not need a bamboo everything set. Cohesion is calm, not matching SKU spam.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Is bamboo always “eco”?',
        a: 'Material stories vary by manufacturing and shipping. We treat it as a useful natural material — not a moral free pass.',
      },
      {
        q: 'What should I replace first?',
        a: 'Whatever you touch daily that annoys you or is failing. Motivation beats perfect order.',
      },
      {
        q: 'Gift or personal swap?',
        a: 'Personal swaps stick better. Gifts work when you know their kitchen gaps.',
      },
    ],
  },
  {
    slug: 'bamboo-lunch-picnic-gear',
    title: 'Bamboo Lunch & Picnic Gear That Travels',
    dek: 'Cutlery rolls, picnic plates, and trays — pack light without single-use piles.',
    primaryQuery: 'bamboo picnic utensils plates',
    category: 'outdoor',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 5,
    heroImage: '/brand/categories/outdoor.webp',
    intro:
      'Picnic bamboo fails when it is fragile theater. You want pieces that survive a tote bag, rinse at a park sink, and dry before the trunk becomes a greenhouse. Pack fewer, better tools.',
    hardNo:
      'Hard no: glass-heavy setups for kids’ parks, and “compostable” piles that still leave a mess because nobody brought a bag out.',
    productEntries: [
      {
        productSlug: 'cutlery-travel-roll',
        rank: 1,
        badge: 'Daily carry',
        pickWhy:
          'A roll that turns desk lunches and road trips away from plastic forks. Wash and dry before rolling closed — trapped moisture is the failure mode.',
      },
      {
        productSlug: 'picnic-plate-stack',
        rank: 2,
        pickWhy:
          'Light plates for grass and tailgates. Stack compactly; avoid using as cutting boards for bones.',
      },
      {
        productSlug: 'picnic-carrier',
        rank: 3,
        pickWhy:
          'Carry structure keeps plates from becoming frisbees in the trunk. Confirm capacity against your usual headcount.',
      },
      {
        productSlug: 'patio-serving-tray',
        rank: 4,
        pickWhy:
          'Balcony and yard service without juggling three glasses. Wipe pollen and moisture after outdoor nights.',
      },
      {
        productSlug: 'reusable-chopstick-set',
        rank: 5,
        pickWhy:
          'Noodle and bowl days travel well with chopsticks that live in the same roll or pouch.',
      },
      {
        productSlug: 'folding-side-table',
        rank: 6,
        pickWhy:
          'When the ground is damp, a small table saves plates and knees. Fold dry before storage.',
      },
    ],
    sections: [
      {
        heading: 'Pack-out is the product',
        body: 'If it does not fit your bag with leftovers space, it will not come. Test the tote at home.',
      },
      {
        heading: 'Rinse discipline',
        body: 'Park sinks are optional. A bottle of water and a towel beat sealed wet cutlery for three days.',
      },
      {
        heading: 'Kids and wind',
        body: 'Light plates fly. Lids, clips, or heavier bowls help. Safety first with toddlers and small parts.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Can these go in a dishwasher after the picnic?',
        a: 'Many bamboo pieces prefer hand wash. Check the listing. When unsure, hand wash travel gear — it is already in the sink story.',
      },
      {
        q: 'How many place settings?',
        a: 'Match your usual group plus one. Overpacking is how carriers stay home.',
      },
      {
        q: 'Indoor lunch only?',
        a: 'A cutlery roll alone covers office days without a full picnic kit.',
      },
    ],
  },
  {
    slug: 'entryway-drop-zone',
    title: 'Entryway Drop Zone in Bamboo',
    dek: 'Keys, mail, remotes — small trays that stop the daily scatter without a full console remodel.',
    primaryQuery: 'entryway key tray organizer',
    category: 'organization',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 5,
    heroImage: '/brand/categories/organization.webp',
    intro:
      'Entry chaos is a system failure, not a character flaw. A single tray teaches keys where to land. Add a remote caddy and mail stops living in the fruit bowl. Bamboo keeps it warm instead of industrial.',
    hardNo:
      'Hard no: five trays that become five messes, and bowls so deep you never see the spare key again.',
    productEntries: [
      {
        productSlug: 'entry-key-tray',
        rank: 1,
        badge: 'Start here',
        pickWhy:
          'Shallow, visible, boring in the best way. Place it where your hand already drops on arrival.',
      },
      {
        productSlug: 'remote-caddy',
        rank: 2,
        pickWhy:
          'Living-room cousin of the key tray. Same habit science — one home for controllers.',
      },
      {
        productSlug: 'lidded-storage-boxes',
        rank: 3,
        pickWhy:
          'When the tray overflows with receipts and batteries, a lidded box becomes the weekly purge target.',
      },
      {
        productSlug: 'magazine-stand',
        rank: 4,
        pickWhy:
          'Vertical parking for catalogs and school papers that otherwise colonize the entry table.',
      },
      {
        productSlug: 'coaster-set-with-caddy',
        rank: 5,
        pickWhy:
          'Guests and wet glasses migrate from entry coffee moments. A caddy keeps coasters from vanishing.',
      },
    ],
    sections: [
      {
        heading: 'One surface, one job',
        body: 'Keys here, mail there. Mixing everything into one decorative bowl recreates the problem with prettier edges.',
      },
      {
        heading: 'Height and sightlines',
        body: 'If you cannot see the object, it is lost. Prefer open trays for daily-carry items.',
      },
      {
        heading: 'Weekly empty',
        body: 'Trays need a two-minute reset. Otherwise they become archaeological digs.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Wall hooks instead?',
        a: 'Hooks are great for bags. Keys still like a tray if hooks scatter them on the floor.',
      },
      {
        q: 'Small apartment — worth it?',
        a: 'Especially. Micro organization prevents multi-use surfaces from becoming junk drawers with legs.',
      },
      {
        q: 'Will bamboo scratch the console?',
        a: 'Most trays are gentle; felt dots help on delicate finishes. Wipe grit from the underside occasionally.',
      },
    ],
  },
  {
    slug: 'desk-bamboo-setup',
    title: 'Bamboo Desk Setup Without the Clutter Cosplay',
    dek: 'Monitor riser, laptop stand, caddy — ergonomics and calm cables, not desk influencer sets.',
    primaryQuery: 'bamboo monitor stand desk organizer',
    category: 'desk',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    heroImage: '/brand/categories/desk.webp',
    intro:
      'Desk bamboo fails as matching props you never adjust. Start with screen height and laptop angle, then a caddy for the three objects you actually touch. Empty aesthetic kits are landfill with better photography.',
    hardNo:
      'Hard no: buying twelve organizers before measuring the desk depth, and stacking so high your neck still loses.',
    productEntries: [
      {
        productSlug: 'monitor-stand-riser',
        rank: 1,
        badge: 'Ergonomics first',
        pickWhy:
          'Top of screen near eye level is the goal. Measure monitor feet and shelf clearance. Cable pass-throughs are a gift when they exist.',
      },
      {
        productSlug: 'laptop-stand',
        rank: 2,
        pickWhy:
          'Laptop-as-monitor needs height plus an external keyboard story. A stand alone without keys still strains wrists.',
      },
      {
        productSlug: 'desk-organizer-caddy',
        rank: 3,
        pickWhy:
          'Pens, clips, drive — one home. If it becomes a junk pit, empty weekly like the entry tray.',
      },
      {
        productSlug: 'cable-management-box',
        rank: 4,
        pickWhy:
          'Power bricks disappear without turning the floor into spaghetti. Leave airflow; do not seal heat sources in a closed oven.',
      },
      {
        productSlug: 'keyboard-wrist-rest',
        rank: 5,
        pickWhy:
          'Comfort accessory after height is fixed. It will not fix a laptop on your lap for eight hours.',
      },
      {
        productSlug: 'phone-dock',
        rank: 6,
        pickWhy:
          'A dock stops the phone from migrating into the keyboard zone every call.',
      },
    ],
    sections: [
      {
        heading: 'Height before décor',
        body: 'Fix neck angle first. Pretty pen cups do not solve shoulders.',
      },
      {
        heading: 'One caddy rule',
        body: 'If two caddies fill immediately, you have a stuff problem, not a storage shortage.',
      },
      {
        heading: 'Bamboo and devices',
        body: 'Keep liquids off wood near keyboards. Wipe dust; avoid soaking cleaners into grain.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Will a riser hold my ultrawide?',
        a: 'Check weight and depth on the listing. Ultrawides often need wider, rated stands.',
      },
      {
        q: 'Laptop stand for sofa work?',
        a: 'Better than pure lap heat, still not a full ergonomic desk. Use for short sessions.',
      },
      {
        q: 'Do I need the full matching set?',
        a: 'No. Riser + one caddy beats a theme park of empty boxes.',
      },
    ],
  },
  {
    slug: 'charcuterie-board-hosting',
    title: 'Charcuterie Board Hosting Without the Stress Spiral',
    dek: 'Board size, groove vs flat, and the host set that survives more than one party.',
    primaryQuery: 'best charcuterie board for hosting',
    category: 'cutting-boards',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    heroImage: '/brand/categories/cutting-boards.webp',
    intro:
      'Hosting boards fail when they are too small for the guest list or too precious to stain with beet hummus. Buy a surface you will load generously, wipe, oil, and reuse — not a one-photo prop.',
    hardNo:
      'Hard no: overcrowding a tiny board into a landslide, and raw meat prep on the same face you just served brie without a full wash.',
    productEntries: [
      {
        productSlug: 'charcuterie-board',
        rank: 1,
        badge: 'Classic host',
        pickWhy:
          'The dedicated serving face. Keep it out of heavy daily onion duty if you want a cleaner guest presentation.',
      },
      {
        productSlug: 'charcuterie-host-set',
        rank: 2,
        badge: 'Ready kit',
        pickWhy:
          'When you want board plus tools in one decision. Confirm what the set includes on the live listing — contents vary.',
      },
      {
        productSlug: 'lazy-susan-turntable',
        rank: 3,
        pickWhy:
          'Reach across the table without standing. Great for cheese nights and hot pot neighbors.',
      },
      {
        productSlug: 'handled-serving-tray',
        rank: 4,
        pickWhy:
          'Carry from kitchen to couch without a death march of small plates. Handles are hospitality infrastructure.',
      },
      {
        productSlug: 'soft-cheese-spreader-set',
        rank: 5,
        pickWhy:
          'Soft cheeses need soft tools. Guests stop double-dipping knives into three spreads.',
      },
      {
        productSlug: 'condiment-dish-set',
        rank: 6,
        pickWhy:
          'Olives, nuts, honey — isolation stops flavor wars on one crowded board.',
      },
    ],
    sections: [
      {
        heading: 'Size to guests, not Instagram',
        body: 'Four people need less real estate than twelve. Overflow to a second board beats a precarious tower.',
      },
      {
        heading: 'Prep vs serve',
        body: 'Slice on a prep board; plate on the pretty one if you care about marks. Or embrace marks as house character.',
      },
      {
        heading: 'Afterparty care',
        body: 'Scrape, wash, dry, oil if needed. Soft cheese left overnight is how boards earn permanent perfume.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Wood and soft cheese safety?',
        a: 'Clean promptly. For high-risk foods, follow sound kitchen hygiene. When unsure, use a plate layer.',
      },
      {
        q: 'Round or rectangular?',
        a: 'Rectangles pack fridges and counters efficiently. Rounds photograph well. Function first.',
      },
      {
        q: 'Do I need slate instead?',
        a: 'Slate is a different aesthetic and care path. Bamboo stays lighter and warmer in hand.',
      },
    ],
  },
  {
    slug: 'bamboo-dinnerware-everyday',
    title: 'Bamboo Dinnerware for Everyday, Not Just Picnics',
    dek: 'Plates, bowls, and care notes when you want calm tableware without porcelain anxiety.',
    primaryQuery: 'bamboo plates and bowls everyday',
    category: 'dining',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    heroImage: '/brand/categories/dining.webp',
    intro:
      'Bamboo dinnerware fails when people expect stoneware immortality or microwave everything. Read care labels. Use it for the meals that match its strengths: weeknight calm, outdoor-friendly weight, kids who test gravity.',
    hardNo:
      'Hard no: broiler experiments, and ignoring “hand wash” until the finish fails then writing a novel review.',
    productEntries: [
      {
        productSlug: 'dinner-plate-set-of-four',
        rank: 1,
        badge: 'Core set',
        pickWhy:
          'Four plates cover couples and small households. Confirm diameter for your dishwasher racks and cabinet height.',
      },
      {
        productSlug: 'bowl-set-of-four',
        rank: 2,
        pickWhy:
          'Bowls do soup, grain, and ice cream without a second shopping trip. Match plate language if you care about table cohesion.',
      },
      {
        productSlug: 'family-salad-bowl',
        rank: 3,
        pickWhy:
          'Sharing bowl for actual salads and popcorn nights. Size beats nesting cute that cannot hold dinner.',
      },
      {
        productSlug: 'ramen-bowl-kit',
        rank: 4,
        pickWhy:
          'When bowls are a meal category, not a side. Check included tools on the listing.',
      },
      {
        productSlug: 'woven-placemat-set',
        rank: 5,
        pickWhy:
          'Softens acoustic and visual noise under plates. Shake crumbs; avoid permanent wet storage.',
      },
      {
        productSlug: 'bamboo-handle-flatware',
        rank: 6,
        pickWhy:
          'Flatware with bamboo handles ties the table together. Hand wash if the listing says so — handles hate long soaks.',
      },
    ],
    sections: [
      {
        heading: 'Read the care line twice',
        body: 'Some bamboo fiber pieces tolerate dishwashers; many prefer hand wash. Your machine’s heat cycle is not a debate club.',
      },
      {
        heading: 'Heat limits',
        body: 'Microwave and oven rules vary by construction. When the listing is silent, do not invent high-heat adventures.',
      },
      {
        heading: 'Mix materials freely',
        body: 'Bamboo plates with ceramic mugs is normal. Matching sets are optional calm, not law.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Is it safe for kids?',
        a: 'Many families like lighter plates. Watch for small parts in kits and follow age guidance on baby-specific items.',
      },
      {
        q: 'Will it stain with tomato sauce?',
        a: 'Pigments can linger on lighter finishes. Rinse sooner; accept some patina on heavy use pieces.',
      },
      {
        q: 'Replace porcelain entirely?',
        a: 'Only if the care and feel suit you. Many homes run mixed tables happily.',
      },
    ],
  },
  {
    slug: 'kitchen-utensil-set-worth-it',
    title: 'Is a Bamboo Utensil Set Worth It?',
    dek: 'What belongs in the crock, what is gadget filler, and nonstick-safe reality.',
    primaryQuery: 'bamboo kitchen utensil set worth it',
    category: 'kitchen',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    heroImage: '/brand/categories/kitchen.webp',
    intro:
      'Utensil sets fail when half the pieces never leave the jar. Worth it means: spoons and spatulas you use weekly, edges kind to nonstick, and a finish that survives hand washing. Skip 20-piece fantasy bundles of mystery tools.',
    hardNo:
      'Hard no: metal scrapers on nonstick “just once,” and 15-piece sets where ten tools are duplicates with new names.',
    productEntries: [
      {
        productSlug: 'artisan-cooking-utensil-set',
        rank: 1,
        badge: 'Core crock',
        pickWhy:
          'A compact set that covers stirring, serving, and flipping basics. Look for smooth finishes without splinter risk.',
      },
      {
        productSlug: 'slim-spatula-trio',
        rank: 2,
        badge: 'Egg & fish',
        pickWhy:
          'Thin edges matter more than another round spoon. A focused trio often beats a bloated set.',
      },
      {
        productSlug: 'locking-kitchen-tongs',
        rank: 3,
        pickWhy:
          'Tongs are the other hand you needed. Locking reduces drawer chaos.',
      },
      {
        productSlug: 'soup-ladle',
        rank: 4,
        pickWhy:
          'If soup is weekly, a dedicated ladle stops using measuring cups as service tools.',
      },
      {
        productSlug: 'everyday-spoon-collection',
        rank: 5,
        pickWhy:
          'When you want spoon variety without spatulas you already own. Build modularly.',
      },
      {
        productSlug: 'universal-knife-block-insert',
        rank: 6,
        pickWhy:
          'Not a utensil — but knife storage next to the crock completes the station. Confirm fit for your block or drawer.',
      },
    ],
    sections: [
      {
        heading: 'Count uses, not pieces',
        body: 'If you cannot name when you would use it this month, leave it. Specialty tools can arrive later with proof of need.',
      },
      {
        heading: 'Nonstick is a contract',
        body: 'Bamboo and wood are classic allies of coated pans. Deep scratches void more than warranties — they ruin cooking.',
      },
      {
        heading: 'Care is short',
        body: 'Hand wash, dry, occasional oil on thirsty wood. Dishwasher heat is how sets go fuzzy and weak.',
      },
    ],
    faq: [
      AMAZON,
      {
        q: 'Silicone instead?',
        a: 'Silicone is great too. Bamboo is warmer in hand and a different aesthetic. Many kitchens mix.',
      },
      {
        q: 'How many pieces is enough?',
        a: 'Often 5–8 daily drivers. Beyond that, storage fights utility.',
      },
      {
        q: 'Splinters?',
        a: 'Quality smooth finishes matter. Sand lightly if a edge raises; retire pieces that keep failing.',
      },
    ],
  },
]

export function getBuyerGuide(slug: string): BuyerGuide | undefined {
  return buyerGuides.find((g) => g.slug === slug)
}

export function buyerGuidesForProduct(productSlug: string): BuyerGuide[] {
  return buyerGuides.filter((g) =>
    g.productEntries.some((e) => e.productSlug === productSlug),
  )
}
