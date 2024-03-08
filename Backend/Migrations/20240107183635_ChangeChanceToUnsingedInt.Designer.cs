﻿// <auto-generated />
using System;
using DERPWebsite.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PDPWebsite.Migrations
{
    [DbContext(typeof(Database))]
    [Migration("20240107183635_ChangeChanceToUnsingedInt")]
    partial class ChangeChanceToUnsingedInt
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("PDPWebsite.Models.AboutInfo", b =>
                {
                    b.Property<decimal>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("numeric(20,0)");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("VisualName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("AboutInfos");
                });

            modelBuilder.Entity("PDPWebsite.Models.Category", b =>
                {
                    b.Property<Guid?>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("IconUrl")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Path")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("PDPWebsite.Models.Expansion", b =>
                {
                    b.Property<Guid?>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("IconUrl")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Path")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Expansions");
                });

            modelBuilder.Entity("PDPWebsite.Models.Quote", b =>
                {
                    b.Property<Guid?>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<long?>("Chance")
                        .HasColumnType("bigint");

                    b.Property<long>("Color")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<decimal>("Creator")
                        .HasColumnType("numeric(20,0)");

                    b.Property<decimal>("Target")
                        .HasColumnType("numeric(20,0)");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Quotes");
                });

            modelBuilder.Entity("PDPWebsite.Models.Resource", b =>
                {
                    b.Property<Guid?>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("CategoryId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("ExpansionId")
                        .HasColumnType("uuid");

                    b.Property<string>("HtmlContent")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("MarkdownContent")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PageName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("Published")
                        .HasColumnType("boolean");

                    b.Property<decimal>("WriterId")
                        .HasColumnType("numeric(20,0)");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.HasIndex("ExpansionId");

                    b.ToTable("Resources");
                });

            modelBuilder.Entity("PDPWebsite.Models.ResourceFile", b =>
                {
                    b.Property<Guid?>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Path")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<Guid>("ResourceId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("ResourceId");

                    b.ToTable("ResourceFiles");
                });

            modelBuilder.Entity("PDPWebsite.Models.Schedule", b =>
                {
                    b.Property<Guid?>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("At")
                        .HasColumnType("timestamp with time zone");

                    b.Property<TimeSpan>("Duration")
                        .HasColumnType("interval");

                    b.Property<decimal>("HostId")
                        .HasColumnType("numeric(20,0)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Schedules");
                });

            modelBuilder.Entity("PDPWebsite.Models.SignUp", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<bool>("IsBackup")
                        .HasColumnType("boolean");

                    b.Property<bool>("IsConfirmed")
                        .HasColumnType("boolean");

                    b.Property<bool>("IsHost")
                        .HasColumnType("boolean");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<Guid>("ScheduleId")
                        .HasColumnType("uuid");

                    b.Property<decimal>("UserId")
                        .HasColumnType("numeric(20,0)");

                    b.HasKey("Id");

                    b.HasIndex("ScheduleId");

                    b.ToTable("Signups");
                });

            modelBuilder.Entity("PDPWebsite.Models.Resource", b =>
                {
                    b.HasOne("PDPWebsite.Models.Category", "Category")
                        .WithMany("Resources")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("PDPWebsite.Models.Expansion", "Expansion")
                        .WithMany("Resources")
                        .HasForeignKey("ExpansionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");

                    b.Navigation("Expansion");
                });

            modelBuilder.Entity("PDPWebsite.Models.ResourceFile", b =>
                {
                    b.HasOne("PDPWebsite.Models.Resource", "Resource")
                        .WithMany("Files")
                        .HasForeignKey("ResourceId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Resource");
                });

            modelBuilder.Entity("PDPWebsite.Models.SignUp", b =>
                {
                    b.HasOne("PDPWebsite.Models.Schedule", "Schedule")
                        .WithMany("Signups")
                        .HasForeignKey("ScheduleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Schedule");
                });

            modelBuilder.Entity("PDPWebsite.Models.Category", b =>
                {
                    b.Navigation("Resources");
                });

            modelBuilder.Entity("PDPWebsite.Models.Expansion", b =>
                {
                    b.Navigation("Resources");
                });

            modelBuilder.Entity("PDPWebsite.Models.Resource", b =>
                {
                    b.Navigation("Files");
                });

            modelBuilder.Entity("PDPWebsite.Models.Schedule", b =>
                {
                    b.Navigation("Signups");
                });
#pragma warning restore 612, 618
        }
    }
}
