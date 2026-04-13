import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.8, 
                ease: "easeOut",
                staggerChildren: 0.1 
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const blobVariants = {
        animate: {
            x: [0, -50, 30, 0],
            y: [0, 50, -40, 0],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, -90, 90, 0],
            transition: {
                duration: 25,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 p-3 overflow-hidden position-relative" style={{ background: '#050510' }}>
            {/* Animated Background Mesh */}
            <motion.div 
                variants={blobVariants}
                animate="animate"
                style={{
                    position: 'absolute', width: '600px', height: '600px', 
                    background: 'radial-gradient(circle, rgba(247, 37, 133, 0.12) 0%, transparent 70%)', 
                    top: '-15%', left: '-10%', filter: 'blur(90px)', zIndex: 0
                }}
            />
            <motion.div 
                variants={blobVariants}
                animate="animate"
                style={{
                    position: 'absolute', width: '500px', height: '500px', 
                    background: 'radial-gradient(circle, rgba(108, 99, 255, 0.1) 0%, transparent 70%)', 
                    bottom: '-10%', right: '-5%', filter: 'blur(80px)', zIndex: 0
                }}
            />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="glass-card p-4 p-md-5 shadow-2xl position-relative" 
                style={{ maxWidth: '520px', width: '100%', zIndex: 1, background: 'rgba(15, 15, 35, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
                <motion.div variants={itemVariants} className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center mb-4 rounded-3xl p-3" 
                         style={{ 
                             background: 'linear-gradient(135deg, rgba(247, 37, 133, 0.2), rgba(108, 99, 255, 0.2))',
                             border: '1px solid rgba(255, 255, 255, 0.1)',
                             backdropFilter: 'blur(10px)'
                         }}>
                        <UserPlus size={40} className="text-secondary" />
                    </div>
                    <h1 className="fw-bold text-white mb-2" style={{ letterSpacing: '-1.5px', fontSize: '2.5rem' }}>Create Account</h1>
                    <p className="text-white-50">Join the elite wealth management club</p>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <motion.div variants={itemVariants} className="mb-3">
                        <label className="card-label mb-2">Member Name</label>
                        <div className="position-relative">
                            <User className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={18} />
                            <input 
                                type="text" 
                                className="form-control premium-input py-3" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ paddingLeft: '50px' }}
                                placeholder="e.g. John Doe"
                                required 
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-3">
                        <label className="card-label mb-2">Portfolio Email</label>
                        <div className="position-relative">
                            <Mail className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={18} />
                            <input 
                                type="email" 
                                className="form-control premium-input py-3" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '50px' }}
                                placeholder="name@domain.com"
                                required 
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-5">
                        <label className="card-label mb-2">Security Key (Password)</label>
                        <div className="position-relative">
                            <Lock className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={18} />
                            <input 
                                type="password" 
                                className="form-control premium-input py-3" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '50px' }}
                                placeholder="Min. 6 characters"
                                minLength={6}
                                required 
                            />
                        </div>
                    </motion.div>

                    <motion.button 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="btn btn-primary-gradient w-100 py-3 fw-bold mb-4 d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '1.2rem', borderRadius: '16px', background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}
                    >
                        Create My Portfolio <ArrowRight size={20} />
                    </motion.button>
                </form>

                <motion.div variants={itemVariants} className="text-center text-white-50 small">
                    Already a member? <Link to="/login" className="text-secondary text-decoration-none fw-bold ms-1">Log In Here</Link>
                </motion.div>
            </motion.div>

            {/* Subtle light leak at top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--secondary), transparent)', opacity: 0.3 }}></div>
        </div>
    );
};

export default Register;
