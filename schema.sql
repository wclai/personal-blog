
CREATE DATABASE personal_blog WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Chinese (Traditional)_Hong Kong SAR.950';

ALTER DATABASE personal_blog OWNER TO postgres;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 239 (class 1255 OID 16422)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 16677)
-- Name: pf_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pf_certificate (
    id integer CONSTRAINT pf_certifications_id_not_null NOT NULL,
    profile_id integer,
    title character varying(100) CONSTRAINT pf_certifications_title_not_null NOT NULL,
    issuer character varying(100),
    issue_date date,
    expiry_date date,
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pf_certificate OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16676)
-- Name: pf_certifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pf_certifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pf_certifications_id_seq OWNER TO postgres;

--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 231
-- Name: pf_certifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pf_certifications_id_seq OWNED BY public.pf_certificate.id;


--
-- TOC entry 228 (class 1259 OID 16641)
-- Name: pf_education; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pf_education (
    id integer NOT NULL,
    profile_id integer,
    institution character varying(100) NOT NULL,
    degree character varying(100),
    field_of_study character varying(100),
    start_month date,
    end_month date,
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    location character varying(100)
);


ALTER TABLE public.pf_education OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16640)
-- Name: pf_education_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pf_education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pf_education_id_seq OWNER TO postgres;

--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 227
-- Name: pf_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pf_education_id_seq OWNED BY public.pf_education.id;


--
-- TOC entry 224 (class 1259 OID 16605)
-- Name: pf_language; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pf_language (
    id integer CONSTRAINT pf_languages_id_not_null NOT NULL,
    profile_id integer,
    language character varying(50) CONSTRAINT pf_languages_language_not_null NOT NULL,
    proficiency character varying(50),
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pf_language OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16604)
-- Name: pf_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pf_languages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pf_languages_id_seq OWNER TO postgres;

--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 223
-- Name: pf_languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pf_languages_id_seq OWNED BY public.pf_language.id;


--
-- TOC entry 238 (class 1259 OID 16732)
-- Name: pf_project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pf_project (
    id integer CONSTRAINT pf_projects_id_not_null NOT NULL,
    profile_id integer,
    title character varying(100) CONSTRAINT pf_projects_title_not_null NOT NULL,
    description text,
    link character varying(255),
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pf_project OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16731)
-- Name: pf_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pf_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pf_projects_id_seq OWNER TO postgres;

--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 237
-- Name: pf_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pf_projects_id_seq OWNED BY public.pf_project.id;


--
-- TOC entry 226 (class 1259 OID 16623)
-- Name: pf_skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pf_skill (
    id integer CONSTRAINT pf_skills_id_not_null NOT NULL,
    profile_id integer,
    skill character varying(100) CONSTRAINT pf_skills_skill_not_null NOT NULL,
    level character varying(50),
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pf_skill OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16622)
-- Name: pf_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pf_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pf_skills_id_seq OWNER TO postgres;

--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 225
-- Name: pf_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pf_skills_id_seq OWNED BY public.pf_skill.id;


--
-- TOC entry 236 (class 1259 OID 16713)
-- Name: pf_social_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pf_social_link (
    id integer CONSTRAINT pf_social_links_id_not_null NOT NULL,
    profile_id integer,
    platform character varying(50) CONSTRAINT pf_social_links_platform_not_null NOT NULL,
    url character varying(255) CONSTRAINT pf_social_links_url_not_null NOT NULL,
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pf_social_link OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16712)
-- Name: pf_social_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pf_social_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pf_social_links_id_seq OWNER TO postgres;

--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 235
-- Name: pf_social_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pf_social_links_id_seq OWNED BY public.pf_social_link.id;


--
-- TOC entry 234 (class 1259 OID 16695)
-- Name: pf_volunteer_experience; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pf_volunteer_experience (
    id integer NOT NULL,
    profile_id integer,
    organization character varying(100) NOT NULL,
    role character varying(100),
    start_month date,
    end_month date,
    description text,
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_present boolean
);


ALTER TABLE public.pf_volunteer_experience OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16694)
-- Name: pf_volunteer_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pf_volunteer_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pf_volunteer_experience_id_seq OWNER TO postgres;

--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 233
-- Name: pf_volunteer_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pf_volunteer_experience_id_seq OWNED BY public.pf_volunteer_experience.id;


--
-- TOC entry 230 (class 1259 OID 16659)
-- Name: pf_work_experience; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pf_work_experience (
    id integer NOT NULL,
    profile_id integer,
    company character varying(100) NOT NULL,
    "position" character varying(100),
    start_month date,
    end_month date,
    description text,
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    location character varying(100),
    is_present boolean
);


ALTER TABLE public.pf_work_experience OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16658)
-- Name: pf_work_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pf_work_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pf_work_experience_id_seq OWNER TO postgres;

--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 229
-- Name: pf_work_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pf_work_experience_id_seq OWNED BY public.pf_work_experience.id;


--
-- TOC entry 222 (class 1259 OID 16587)
-- Name: profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile (
    id integer CONSTRAINT profiles_id_not_null NOT NULL,
    user_id integer,
    name character varying(100) CONSTRAINT profiles_name_not_null NOT NULL,
    job_title character varying(100),
    location character varying(100),
    contact jsonb,
    introduction text,
    photo_path character varying(255),
    remark text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    pf_name character varying(100),
    is_public boolean DEFAULT false,
    tagline character varying(255),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.profile OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16586)
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profiles_id_seq OWNER TO postgres;

--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 221
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profile.id;


--
-- TOC entry 220 (class 1259 OID 16406)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16405)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4924 (class 2604 OID 16680)
-- Name: pf_certificate id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_certificate ALTER COLUMN id SET DEFAULT nextval('public.pf_certifications_id_seq'::regclass);


--
-- TOC entry 4918 (class 2604 OID 16644)
-- Name: pf_education id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_education ALTER COLUMN id SET DEFAULT nextval('public.pf_education_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 16608)
-- Name: pf_language id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_language ALTER COLUMN id SET DEFAULT nextval('public.pf_languages_id_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 16735)
-- Name: pf_project id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_project ALTER COLUMN id SET DEFAULT nextval('public.pf_projects_id_seq'::regclass);


--
-- TOC entry 4915 (class 2604 OID 16626)
-- Name: pf_skill id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_skill ALTER COLUMN id SET DEFAULT nextval('public.pf_skills_id_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 16716)
-- Name: pf_social_link id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_social_link ALTER COLUMN id SET DEFAULT nextval('public.pf_social_links_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 16698)
-- Name: pf_volunteer_experience id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_volunteer_experience ALTER COLUMN id SET DEFAULT nextval('public.pf_volunteer_experience_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 16662)
-- Name: pf_work_experience id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_work_experience ALTER COLUMN id SET DEFAULT nextval('public.pf_work_experience_id_seq'::regclass);


--
-- TOC entry 4907 (class 2604 OID 16590)
-- Name: profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 16409)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4951 (class 2606 OID 16688)
-- Name: pf_certificate pf_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_certificate
    ADD CONSTRAINT pf_certifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 16652)
-- Name: pf_education pf_education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_education
    ADD CONSTRAINT pf_education_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 16616)
-- Name: pf_language pf_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_language
    ADD CONSTRAINT pf_languages_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 16743)
-- Name: pf_project pf_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_project
    ADD CONSTRAINT pf_projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 16634)
-- Name: pf_skill pf_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_skill
    ADD CONSTRAINT pf_skills_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 16725)
-- Name: pf_social_link pf_social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_social_link
    ADD CONSTRAINT pf_social_links_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 16706)
-- Name: pf_volunteer_experience pf_volunteer_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_volunteer_experience
    ADD CONSTRAINT pf_volunteer_experience_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 16670)
-- Name: pf_work_experience pf_work_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_work_experience
    ADD CONSTRAINT pf_work_experience_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 16598)
-- Name: profile profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 16421)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4939 (class 2606 OID 16419)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2620 OID 16755)
-- Name: pf_certificate set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pf_certificate FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4971 (class 2620 OID 16753)
-- Name: pf_education set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pf_education FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4969 (class 2620 OID 16751)
-- Name: pf_language set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pf_language FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4976 (class 2620 OID 16758)
-- Name: pf_project set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pf_project FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4970 (class 2620 OID 16752)
-- Name: pf_skill set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pf_skill FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4975 (class 2620 OID 16757)
-- Name: pf_social_link set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pf_social_link FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4974 (class 2620 OID 16756)
-- Name: pf_volunteer_experience set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pf_volunteer_experience FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4972 (class 2620 OID 16754)
-- Name: pf_work_experience set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pf_work_experience FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4968 (class 2620 OID 16750)
-- Name: profile set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4967 (class 2620 OID 16424)
-- Name: users trigger_update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4963 (class 2606 OID 16689)
-- Name: pf_certificate pf_certifications_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_certificate
    ADD CONSTRAINT pf_certifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4961 (class 2606 OID 16653)
-- Name: pf_education pf_education_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_education
    ADD CONSTRAINT pf_education_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4959 (class 2606 OID 16617)
-- Name: pf_language pf_languages_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_language
    ADD CONSTRAINT pf_languages_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4966 (class 2606 OID 16744)
-- Name: pf_project pf_projects_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_project
    ADD CONSTRAINT pf_projects_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4960 (class 2606 OID 16635)
-- Name: pf_skill pf_skills_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_skill
    ADD CONSTRAINT pf_skills_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4965 (class 2606 OID 16726)
-- Name: pf_social_link pf_social_links_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_social_link
    ADD CONSTRAINT pf_social_links_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4964 (class 2606 OID 16707)
-- Name: pf_volunteer_experience pf_volunteer_experience_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_volunteer_experience
    ADD CONSTRAINT pf_volunteer_experience_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4962 (class 2606 OID 16671)
-- Name: pf_work_experience pf_work_experience_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pf_work_experience
    ADD CONSTRAINT pf_work_experience_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- TOC entry 4958 (class 2606 OID 16599)
-- Name: profile profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-11-23 20:49:18

--
-- PostgreSQL database dump complete
--

\unrestrict Q2HH3YXwx600pYtcI00kDeXY5ffIRxq7IkMm1o5zaaghD3jsw4DkwGY7xTxH3Kq

-- Completed on 2025-11-23 20:49:18

--
-- PostgreSQL database cluster dump complete
--

