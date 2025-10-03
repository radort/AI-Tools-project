export interface Author {
  id: number
  name: string
  email: string
}

export interface Comment {
  id: number
  tool_id: number
  content: string
  author: Author
  created_at: string
  updated_at: string
  can_edit: boolean
  can_delete: boolean
}

export interface CommentFormData {
  content: string
}

export interface CommentsResponse {
  data: Comment[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface CommentResponse {
  data: Comment
  message?: string
}