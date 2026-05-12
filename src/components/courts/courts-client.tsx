'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  Search,
  Filter,
  Grid3x3,
  List,
  Sparkles,
  ArrowRight,
  Calendar
} from 'lucide-react'
import { CourtImage } from '@/components/shared/court-image'
import { formatCurrency } from '@/lib/utils/currency'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Court {
  id: number
  name: string
  location: string
  description: string
  price_per_hour: number
  image: string | null
  is_available: boolean
}

interface CourtsClientProps {
  courts: Court[]
  error?: string
}

export function CourtsClient({ courts, error }: CourtsClientProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredCourts, setFilteredCourts] = useState(courts)
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = courts.filter(court =>
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (sortBy === 'price') {
      filtered = filtered.sort((a, b) => a.price_per_hour - b.price_per_hour)
    } else {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredCourts(filtered)
  }, [searchQuery, sortBy, courts])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-3"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Booking Lapangan</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-5xl font-bold mb-3"
            >
              Pilih Lapangan Favoritmu 🎾
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl opacity-90 max-w-2xl"
            >
              {courts.length} lapangan tersedia untuk booking. Pilih yang sesuai dengan kebutuhanmu!
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari lapangan atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
              className="px-4 h-12 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="name">Urutkan: Nama</option>
              <option value="price">Urutkan: Harga</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-gray-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Menampilkan <span className="font-semibold text-emerald-600">{filteredCourts.length}</span> lapangan
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Reset pencarian
            </button>
          )}
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-600 mb-8"
        >
          <p className="font-medium">Error loading courts</p>
          <p className="text-sm mt-1">{error}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredCourts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white border-2 border-dashed border-gray-200 p-12 text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchQuery ? 'Tidak ada hasil' : 'Belum ada lapangan'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Coba kata kunci lain atau reset pencarian' 
              : 'Silakan hubungi admin untuk menambahkan lapangan'}
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')} variant="outline">
              Reset Pencarian
            </Button>
          )}
        </motion.div>
      )}

      {/* Courts Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredCourts.map((court, index) => (
              <motion.div
                key={court.id}
                variants={item}
                layout
              >
                <CourtCardModern court={court} index={index} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredCourts.map((court, index) => (
              <motion.div
                key={court.id}
                variants={item}
                layout
              >
                <CourtCardList court={court} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Modern Grid Card
function CourtCardModern({ court, index }: { court: Court; index: number }) {
  return (
    <Link href={`/courts/${court.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300"
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {court.image ? (
            <CourtImage
              imageUrl={court.image}
              alt={court.name}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={index < 3}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Calendar className="h-16 w-16 text-gray-300" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Floating badge */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-emerald-600 shadow-lg">
              Tersedia
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
            {court.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{court.location}</span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {court.description}
          </p>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="text-xs text-gray-500 mb-1">Harga per jam</div>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(court.price_per_hour)}
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-3 transition-all">
              <span className="text-sm">Booking</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// List View Card
function CourtCardList({ court, index }: { court: Court; index: number }) {
  return (
    <Link href={`/courts/${court.id}`}>
      <motion.div
        whileHover={{ x: 4 }}
        className="group flex flex-col sm:flex-row gap-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 p-6"
      >
        {/* Image */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
          {court.image ? (
            <CourtImage
              imageUrl={court.image}
              alt={court.name}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={index < 3}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Calendar className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {court.name}
              </h3>
              <div className="px-3 py-1 rounded-full bg-emerald-100 text-xs font-semibold text-emerald-600">
                Tersedia
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{court.location}</span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              {court.description}
            </p>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Harga per jam</div>
              <div className="text-3xl font-bold text-emerald-600">
                {formatCurrency(court.price_per_hour)}
              </div>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 group-hover:gap-3 transition-all">
              Booking Sekarang
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
