'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
// Simple icons
const CheckIcon = ({ className }: { className?: string }) => <span className={className}>✓</span>
const ChevronUpDownIcon = ({ className }: { className?: string }) => <span className={className}>↕️</span>

export interface DropdownOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface DropdownProps {
  value: string | number | null
  onChange: (value: string | number) => void
  options: DropdownOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  required = false,
}: DropdownProps) {
  const selectedOption = options.find(option => option.value === value)

  return (
    <div className="w-full">
      {label && (
        <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Listbox.Label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ${
              error
                ? 'ring-red-300 focus:ring-red-500'
                : 'ring-gray-300 focus:ring-indigo-500'
            } focus:outline-none focus:ring-2 sm:text-sm ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="block truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active, disabled: optionDisabled }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                    } ${optionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Multi-select dropdown component
export interface MultiSelectDropdownProps {
  values: (string | number)[]
  onChange: (values: (string | number)[]) => void
  options: DropdownOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

export function MultiSelectDropdown({
  values,
  onChange,
  options,
  placeholder = 'Select options',
  label,
  error,
  disabled = false,
  required = false,
}: MultiSelectDropdownProps) {
  const selectedOptions = options.filter(option => values.includes(option.value))

  const displayText = selectedOptions.length > 0
    ? selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length} selected`
    : placeholder

  const handleToggle = (value: string | number) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <div className="w-full">
      {label && (
        <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Listbox.Label>
      )}
      <Listbox value={values} onChange={onChange} disabled={disabled} multiple>
        <div className="relative">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ${
              error
                ? 'ring-red-300 focus:ring-red-500'
                : 'ring-gray-300 focus:ring-indigo-500'
            } focus:outline-none focus:ring-2 sm:text-sm ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="block truncate">{displayText}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active, disabled: optionDisabled }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                    } ${optionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                  value={option.value}
                  disabled={option.disabled}
                  onClick={() => handleToggle(option.value)}
                >
                  {() => (
                    <>
                      <span
                        className={`block truncate ${
                          values.includes(option.value) ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {values.includes(option.value) ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}