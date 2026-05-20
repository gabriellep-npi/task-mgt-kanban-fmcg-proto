import { Task } from './types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'fmcg-1',
    title: 'Q3 Retail Campaign Asset Sign-off',
    description: `Collaborate with the creative agency on final visual layouts for the Q3 launch of standard retail packaging.

### Key Deliverables:
1. **Review artwork files** (verify dimensions & legal texts).
2. **Regulatory safety check**: Confirm barcode density & ingredient declarations.
3. **Approve production proof**: Ensure colors map correctly to Pantone guidelines.
4. **Archive final masters**: Upload to Shared Library.`,
    owner: 'Sarah Connor',
    dueDate: '2026-05-27',
    priority: 'High',
    department: 'Creative',
    status: 'To Do',
    archived: false,
    createdAt: '2026-05-18T09:00:00Z'
  },
  {
    id: 'fmcg-2',
    title: 'Vendor Audits: Eco-Friendly Shrink Wrap',
    description: `Evaluate vendor bids for replacement biodegradable transport film wraps to satisfy corporate sustainability milestones.

* Review tensile strength data sheets.
* Verify compatibility with packaging line machinery.
* Compile price-per-roll analysis across local partners.`,
    owner: 'Markus Vance',
    dueDate: '2026-05-24',
    priority: 'Medium',
    department: 'Supply Chain',
    status: 'In Progress',
    archived: false,
    createdAt: '2026-05-19T10:30:00Z'
  },
  {
    id: 'fmcg-3',
    title: 'Influencer Retail Campaign Activation',
    description: `Draft and sign service agreements for the upcoming *BioGreen* shampoo retail launch.

### Channels:
- **TikTok**: Three micro-influencer product tests.
- **Instagram**: Dynamic stories with Store-Locator discount links.`,
    owner: 'Elena Rostova',
    dueDate: '2026-05-18',
    priority: 'Low',
    department: 'Marketing',
    status: 'Done',
    archived: false,
    createdAt: '2026-05-12T14:15:00Z'
  },
  {
    id: 'fmcg-4',
    title: 'Cold Storage Compliance Certificate Audit',
    description: `Assess daily temperature logs in Singapore Hub A, Bay 4 to ensure complete dairy chain integrity.

Ensure no deviations exceed standard storage duration ceilings. Update temperature checklists and verify sign-off sheets.`,
    owner: 'John Doe',
    dueDate: '2026-05-23',
    priority: 'High',
    department: 'Operations',
    status: 'To Do',
    archived: false,
    createdAt: '2026-05-19T16:00:00Z'
  },
  {
    id: 'fmcg-5',
    title: 'Q4 Merchandising Capital Allocations',
    description: `Review display rail manufacturing costs and formulate the budget justification write-up for finance approval. Include estimates for retail store counter display boxes.`,
    owner: 'Alice Cooper',
    dueDate: '2026-06-01',
    priority: 'Medium',
    department: 'Finance',
    status: 'To Do',
    archived: false,
    createdAt: '2026-05-20T08:00:00Z'
  }
];
