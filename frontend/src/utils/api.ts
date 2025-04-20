import { API_BASE_URL } from "../config";

// API请求基础URL
const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

// 创建随机邮箱
export const createRandomMailbox = async (expiresInHours = 24) => {
  try {
    const requestBody = JSON.stringify({ expiresInHours });
    const response = await fetch(apiUrl('/api/mailboxes'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('访问被拒绝：请检查您的权限或联系管理员。');
      }
      throw new Error('Failed to create mailbox');
    }

    const data = await response.json();
    if (data.success) {
      return { success: true, mailbox: data.mailbox };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error creating random mailbox:', error);
    return { success: false, error };
  }
};

// 创建自定义邮箱
export const createCustomMailbox = async (address: string, expiresInHours = 24) => {
  try {
    if (!address.trim()) {
      return { success: false, error: 'Invalid address' };
    }

    const response = await fetch(apiUrl('/api/mailboxes'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: address.trim(), expiresInHours }),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('访问被拒绝：请检查您的权限或联系管理员。');
      }
      if (response.status === 400) {
        const data = await response.json();
        return { success: false, error: data.error || 'Address already exists' };
      }
      throw new Error('Failed to create mailbox');
    }

    const data = await response.json();
    if (data.success) {
      return { success: true, mailbox: data.mailbox };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error creating custom mailbox:', error);
    return { success: false, error };
  }
};

// 获取邮箱信息
export const getMailbox = async (address: string) => {
  try {
    const response = await fetch(apiUrl(`/api/mailboxes/${address}`));

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('访问被拒绝：请检查您的权限或联系管理员。');
      }
      if (response.status === 404) {
        return { success: false, error: 'Mailbox not found' };
      }
      throw new Error('Failed to fetch mailbox');
    }

    const data = await response.json();
    if (data.success) {
      return { success: true, mailbox: data.mailbox };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error fetching mailbox:', error);
    return { success: false, error };
  }
};

// 获取邮件列表
export const getEmails = async (address: string) => {
  try {
    if (!address) {
      return { success: false, error: 'Address is empty', emails: [] };
    }

    const response = await fetch(apiUrl(`/api/mailboxes/${address}/emails`));

    if (response.status === 403) {
      throw new Error('访问被拒绝：请检查您的权限或联系管理员。');
    }
    if (response.status === 404) {
      return { success: false, error: 'Mailbox not found', notFound: true };
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      return { success: true, emails: data.emails };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error fetching emails:', error);
    return { success: false, error, emails: [] };
  }
};

// 删除邮箱
export const deleteMailbox = async (address: string) => {
  try {
    const response = await fetch(apiUrl(`/api/mailboxes/${address}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('访问被拒绝：请检查您的权限或联系管理员。');
      }
      throw new Error('Failed to delete mailbox');
    }

    const data = await response.json();
    if (data.success) {
      return { success: true };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error deleting mailbox:', error);
    return { success: false, error };
  }
};

// 保存邮箱信息到本地存储
export const saveMailboxToLocalStorage = (mailbox: Mailbox) => {
  localStorage.setItem('tempMailbox', JSON.stringify({ ...mailbox, savedAt: Date.now() / 1000 }));
};

// 从本地存储获取邮箱信息
export const getMailboxFromLocalStorage = (): Mailbox | null => {
  const savedMailbox = localStorage.getItem('tempMailbox');
  if (!savedMailbox) return null;

  try {
    const mailbox = JSON.parse(savedMailbox) as Mailbox & { savedAt: number };
    const now = Date.now() / 1000;

    if (mailbox.expiresAt < now) {
      localStorage.removeItem('tempMailbox');
      return null;
    }

    return mailbox;
  } catch (error) {
    localStorage.removeItem('tempMailbox');
    return null;
  }
};

// 从本地存储删除邮箱信息
export const removeMailboxFromLocalStorage = () => {
  localStorage.removeItem('tempMailbox');
};
