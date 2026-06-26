const colors = {
  Applied:   'bg-blue-50 text-blue-700',
  OA:        'bg-purple-50 text-purple-700',
  Interview: 'bg-amber-50 text-amber-700',
  Rejected:  'bg-red-50 text-red-700',
  Offer:     'bg-green-50 text-green-700',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}