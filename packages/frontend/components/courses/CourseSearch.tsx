/**
 * CourseSearch Component - Coach IA Hugo
 * Barre de recherche avec autocomplétion pour les courses
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { SearchSuggestion } from '../../lib/services/courseService'

interface CourseSearchProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  suggestions: SearchSuggestion[]
  loading?: boolean
  onSuggestionRequest: (query: string) => void
  placeholder?: string
  className?: string
}

export function CourseSearch({
  value,
  onChange,
  onSearch,
  suggestions,
  loading = false,
  onSuggestionRequest,
  placeholder = "Rechercher une course ou un lieu...",
  className = ""
}: CourseSearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    if (newValue.length >= 2) {
      onSuggestionRequest(newValue)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
    setShowSuggestions(false)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value)
    onSearch(suggestion.value)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSuggestionIcon = (type: string) => {
    if (type === 'course') {
      return (
        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (value.length >= 2 && suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder={placeholder}
            className="block w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors"
          />

          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}

          {!loading && (
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-accent transition-colors ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
            >
              {getSuggestionIcon(suggestion.type)}
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {suggestion.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {suggestion.type === 'course' ? 'Course' : 'Lieu'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}