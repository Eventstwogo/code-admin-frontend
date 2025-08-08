"use client"

import React, { useEffect, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import axiosInstance from "@/lib/axiosInstance"
type ContactUsType = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  message: string
  created_at: string
}

const columns: ColumnDef<ContactUsType>[] = [
 {
  id: "sno",
  header: "S.No",
  cell: ({ row }) => row.index + 1,
},
  {
    accessorKey: "firstname",
    header: "First Name",
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div
        className="max-w-xs truncate text-gray-700"
        title={row.original.message}
      >
        {row.original.message}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Submitted On",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString(),
  },
]

const DataTable = ({
  data,
  columns,
}: {
  data: ContactUsType[]
  columns: ColumnDef<ContactUsType>[]
}) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="p-4 text-left font-semibold text-muted-foreground">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-black/20">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const AdminEnquiriesPage = () => {
  const [formData, setFormData] = useState<ContactUsType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
        try {
    const response=await axiosInstance.get("/api/v1/admin/contact-us")
      const data=response.data.data;
       setFormData(data)
      console.log("data",data);
        } catch (error) {
          console.error(error);
        }
      setTimeout(() => {
       
        setLoading(false)
      }, 1000)
    }

    fetchData()
  }, [])

  return (
    <div className="p-6">
    
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-10">User Enquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <DataTable columns={columns} data={formData} />
          )}
        </CardContent>

    </div>
  )
}

export default AdminEnquiriesPage
