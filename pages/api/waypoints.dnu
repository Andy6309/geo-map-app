// pages/api/waypoints.js
import pool from '../../lib/db'

export default async function handler(req, res) {
    const client = await pool.connect()

    try {
        const result = await client.query('SELECT * FROM waypoints')
        res.status(200).json(result.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching waypoints' })
    } finally {
        client.release()
    }
}
