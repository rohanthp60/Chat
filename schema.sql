--
-- PostgreSQL database dump
--

\restrict cK6xdxAfEyOYim8SUQgaALARo5qFUMOrqCw70T7tcjMcmIgchVbSwHAazXJF7Mb

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

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
-- Name: genders; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.genders AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: roles; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.roles AS ENUM (
    'admin',
    'teacher',
    'student'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ChatUserRelation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatUserRelation" (
    "userId" character varying(100),
    name character varying(100),
    "chatId" character varying(100),
    "readSince" timestamp with time zone
);


--
-- Name: Chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Chats" (
    id integer NOT NULL,
    "chatId" character varying(100) NOT NULL,
    conversation jsonb,
    "groupChat" boolean DEFAULT false,
    name character varying(100),
    admin character varying(100)
);


--
-- Name: Chats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Chats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Chats_id_seq" OWNED BY public."Chats".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    uid integer NOT NULL,
    "firstName" character varying(100),
    "middleName" character varying(100),
    "lastName" character varying(100),
    gender public.genders,
    "dateOfBirth" date,
    "passwordHash" character varying(100),
    "userId" character varying(100) NOT NULL
);


--
-- Name: Users_uid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Users_uid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Users_uid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Users_uid_seq" OWNED BY public."Users".uid;


--
-- Name: Chats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Chats" ALTER COLUMN id SET DEFAULT nextval('public."Chats_id_seq"'::regclass);


--
-- Name: Users uid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users" ALTER COLUMN uid SET DEFAULT nextval('public."Users_uid_seq"'::regclass);


--
-- Name: Chats Chats_chatId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_chatId_key" UNIQUE ("chatId");


--
-- Name: Chats Chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (uid);


--
-- Name: Users Users_userId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_userId_key" UNIQUE ("userId");


--
-- Name: ChatUserRelation ChatUserRelation_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatUserRelation"
    ADD CONSTRAINT "ChatUserRelation_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chats"("chatId") ON DELETE CASCADE;


--
-- Name: ChatUserRelation ChatUserRelation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatUserRelation"
    ADD CONSTRAINT "ChatUserRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"("userId");


--
-- Name: Chats Chats_admin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_admin_fkey" FOREIGN KEY (admin) REFERENCES public."Users"("userId") ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict cK6xdxAfEyOYim8SUQgaALARo5qFUMOrqCw70T7tcjMcmIgchVbSwHAazXJF7Mb

