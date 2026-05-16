@props(['status'])

@php
$configs = [
    'TERSEDIA'            => ['color' => 'emerald', 'label' => 'Tersedia'],
    'DIPESAN'             => ['color' => 'blue',    'label' => 'Dipesan'],
    'MENUNGGU_PEMBAYARAN' => ['color' => 'amber',   'label' => 'Menunggu Bayar'],
    'DIKONFIRMASI'        => ['color' => 'indigo',  'label' => 'Dikonfirmasi'],
    'DIHUNI'              => ['color' => 'violet',  'label' => 'Dihuni'],
    'SELESAI'             => ['color' => 'slate',   'label' => 'Selesai'],
    'DIBATALKAN'          => ['color' => 'red',     'label' => 'Dibatalkan'],
    'OPEN'                => ['color' => 'red',     'label' => 'Open'],
    'IN_PROGRESS'         => ['color' => 'amber',   'label' => 'In Progress'],
    'RESOLVED'            => ['color' => 'emerald', 'label' => 'Resolved'],
    'SUCCESS'             => ['color' => 'emerald', 'label' => 'Success'],
    'PENDING'             => ['color' => 'amber',   'label' => 'Pending'],
    'FAILED'              => ['color' => 'red',     'label' => 'Failed'],
];

$cfg   = $configs[$status] ?? ['color' => 'slate', 'label' => $status];
$color = $cfg['color'];
$label = $cfg['label'];

$classes = match($color) {
    'emerald' => 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'blue'    => 'bg-blue-100 text-blue-700 border-blue-200',
    'amber'   => 'bg-amber-100 text-amber-700 border-amber-200',
    'indigo'  => 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'violet'  => 'bg-violet-100 text-violet-700 border-violet-200',
    'red'     => 'bg-red-100 text-red-700 border-red-200',
    default   => 'bg-slate-100 text-slate-600 border-slate-200',
};
@endphp

<span class="inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border {{ $classes }}">
    {{ $label }}
</span>
